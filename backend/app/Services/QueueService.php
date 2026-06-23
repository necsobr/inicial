<?php

namespace App\Services;

use App\Models\QueueEntry;
use App\Models\ServiceOrder;
use App\Models\User;
use Carbon\Carbon;

class QueueService
{
    public function __construct(private NotificationService $notificationService) {}

    public function join(ServiceOrder $serviceOrder, User $user, array $data): QueueEntry
    {
        $position = QueueEntry::where('service_order_id', $serviceOrder->id)
            ->whereNotIn('status', ['recusado', 'expirado'])
            ->max('position') + 1;

        $expiresAt = null;
        if ($position <= $serviceOrder->sponsor_slots) {
            $expiresAt = Carbon::now()->addDays(2);
        }

        $entry = QueueEntry::create([
            'service_order_id' => $serviceOrder->id,
            'user_id'          => $user->id,
            'name'             => $data['name'] ?? $user->name,
            'company'          => $data['company'] ?? $user->company,
            'phone'            => $data['phone'] ?? $user->phone,
            'position'         => $position,
            'status'           => 'aguardando',
            'joined_at'        => Carbon::now(),
            'expires_at'       => $expiresAt,
        ]);

        if ($serviceOrder->team_id) {
            $this->notificationService->createForTeam(
                $serviceOrder->team_id,
                'patrocinador',
                "{$entry->name} ({$entry->company}) entrou na fila da O.S. #{$serviceOrder->id} na posição {$position}.",
                true
            );
        }

        return $entry;
    }

    public function pay(QueueEntry $entry): QueueEntry
    {
        $entry->update(['status' => 'pago', 'expires_at' => null]);

        $serviceOrder = $entry->serviceOrder;

        if ($serviceOrder?->team_id) {
            $this->notificationService->createForTeam(
                $serviceOrder->team_id,
                'patrocinador',
                "{$entry->name} ({$entry->company}) confirmou o pagamento do patrocínio na O.S. #{$serviceOrder->id}.",
                true
            );

            $slotsPagos = QueueEntry::where('service_order_id', $serviceOrder->id)
                ->where('status', 'pago')
                ->count();

            if ($slotsPagos >= $serviceOrder->sponsor_slots) {
                $this->notificationService->createForTeam(
                    $serviceOrder->team_id,
                    'patrocinador',
                    "Todas as {$serviceOrder->sponsor_slots} vaga(s) de patrocínio da O.S. #{$serviceOrder->id} foram preenchidas!",
                    true
                );
            }
        }

        return $entry;
    }

    public function decline(QueueEntry $entry): QueueEntry
    {
        $entry->update(['status' => 'recusado']);
        $this->advanceQueue($entry->serviceOrder);
        return $entry;
    }

    public function transferOnClose(ServiceOrder $closingOrder): void
    {
        $pending = QueueEntry::where('service_order_id', $closingOrder->id)
            ->whereNotIn('status', ['pago', 'recusado', 'expirado'])
            ->with('user')
            ->orderBy('position')
            ->get();

        if ($pending->isEmpty()) return;

        $nextOS = ServiceOrder::where('team_id', $closingOrder->team_id)
            ->where('id', '!=', $closingOrder->id)
            ->where('status', 'ativa')
            ->where('start_date', '>', now()->toDateString())
            ->orderBy('start_date')
            ->first();

        // Sem próxima O.S.: apenas expira as entradas
        if (!$nextOS) {
            QueueEntry::where('service_order_id', $closingOrder->id)
                ->whereNotIn('status', ['pago', 'recusado', 'expirado'])
                ->update(['status' => 'expirado']);
            return;
        }

        // Filtra apenas usuários que ainda não estão na próxima O.S.
        $toTransfer = $pending->filter(function ($entry) use ($nextOS) {
            return !QueueEntry::where('service_order_id', $nextOS->id)
                ->where('user_id', $entry->user_id)
                ->whereNotIn('status', ['recusado', 'expirado'])
                ->exists();
        });

        $count = $toTransfer->count();

        if ($count > 0) {
            // Abre espaço no topo da fila para os transferidos
            QueueEntry::where('service_order_id', $nextOS->id)
                ->whereNotIn('status', ['recusado', 'expirado'])
                ->increment('position', $count);
        }

        $newPosition = 1;
        foreach ($toTransfer as $entry) {
            $withinSlots = $newPosition <= $nextOS->sponsor_slots;

            QueueEntry::create([
                'service_order_id' => $nextOS->id,
                'user_id'          => $entry->user_id,
                'name'             => $entry->name,
                'company'          => $entry->company,
                'phone'            => $entry->phone,
                'position'         => $newPosition,
                'status'           => 'aguardando',
                'joined_at'        => Carbon::now(),
                'expires_at'       => $withinSlots ? Carbon::now()->addDays(2) : null,
            ]);

            $newPosition++;
        }

        // Expira as entradas originais
        QueueEntry::where('service_order_id', $closingOrder->id)
            ->whereNotIn('status', ['pago', 'recusado', 'expirado'])
            ->update(['status' => 'expirado']);

        $names = $toTransfer->pluck('name')->join(', ');
        $this->notificationService->createForTeam(
            $nextOS->team_id,
            'patrocinador',
            "{$count} participante(s) transferido(s) da O.S. #{$closingOrder->id} para a O.S. #{$nextOS->id} com prioridade: {$names}.",
            true
        );
    }

    private function advanceQueue(ServiceOrder $serviceOrder): void
    {
        $next = QueueEntry::where('service_order_id', $serviceOrder->id)
            ->where('status', 'aguardando')
            ->whereNull('expires_at')
            ->orderBy('position')
            ->first();

        if ($next) {
            $next->update(['expires_at' => Carbon::now()->addDays(2)]);

            $this->notificationService->createForTeam(
                $serviceOrder->team_id,
                'patrocinador',
                "{$next->name} avançou na fila e tem 2 dias para confirmar o patrocínio na O.S. #{$serviceOrder->id}."
            );
        }
    }
}
