<?php

namespace App\Console\Commands;

use App\Models\QueueEntry;
use App\Models\ServiceOrder;
use App\Services\QueueService;
use Illuminate\Console\Command;

class TransferQueueOnClosedOrdersCommand extends Command
{
    protected $signature   = 'queue:transfer-closed';
    protected $description = 'Transfere usuários pendentes em O.S. encerradas/canceladas para a próxima O.S. da equipe';

    public function __construct(private QueueService $queueService) {
        parent::__construct();
    }

    public function handle(): void
    {
        $orders = ServiceOrder::whereIn('status', ['encerrada', 'cancelada'])
            ->whereHas('queueEntries', fn($q) =>
                $q->whereNotIn('status', ['pago', 'recusado', 'expirado'])
            )
            ->with('team')
            ->get();

        if ($orders->isEmpty()) {
            $this->info('Nenhuma O.S. encerrada/cancelada com entradas pendentes encontrada.');
            return;
        }

        $this->table(
            ['O.S. ID', 'Equipe', 'Status', 'Pendentes'],
            $orders->map(fn($os) => [
                $os->id,
                $os->team?->name ?? '—',
                $os->status,
                QueueEntry::where('service_order_id', $os->id)
                    ->whereNotIn('status', ['pago', 'recusado', 'expirado'])
                    ->count(),
            ])
        );

        if (!$this->confirm('Deseja aplicar a transferência para todas essas O.S.?')) {
            $this->line('Cancelado.');
            return;
        }

        foreach ($orders as $order) {
            $this->line("Processando O.S. #{$order->id} ({$order->team?->name})...");
            $this->queueService->transferOnClose($order);
            $this->info("  ✓ Concluído.");
        }

        $this->info('Transferências aplicadas com sucesso.');
    }
}
