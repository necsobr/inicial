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
