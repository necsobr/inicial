<?php

namespace Database\Seeders;

use App\Models\QueueEntry;
use App\Models\ServiceOrder;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TestQueueTransferSeeder extends Seeder
{
    public function run(): void
    {
        // O.S. encerrada na equipe 1 (antes da OS#4 que é de agosto/2026)
        $osEncerrada = ServiceOrder::updateOrCreate(
            ['id' => 999],
            [
                'team_id'      => 1,
                'name'         => '[TESTE] O.S. encerrada',
                'paper_type'   => 'A4',
                'recurrence'   => 'unica',
                'single_date'  => '2026-03-01',
                'start_date'   => '2026-03-01',
                'meetings_count'  => 1,
                'sponsor_slots'   => 2,
                'quota_price'     => 60,
                'status'       => 'encerrada',
                'created_by'   => 1,
            ]
        );

        // 3 usuários na fila da O.S. encerrada (aguardando — devem ser transferidos)
        $usuarios = User::whereIn('id', [4, 10, 11])->get();

        foreach ($usuarios as $i => $user) {
            QueueEntry::updateOrCreate(
                ['service_order_id' => $osEncerrada->id, 'user_id' => $user->id],
                [
                    'name'      => $user->name,
                    'company'   => $user->company ?? 'Empresa Teste',
                    'phone'     => $user->phone ?? '11999990000',
                    'position'  => $i + 1,
                    'status'    => 'aguardando',
                    'joined_at' => Carbon::now(),
                    'expires_at' => null,
                ]
            );
        }

        $this->command->info('Seeder de teste criado:');
        $this->command->info("  → OS#999 (encerrada, team=1) com 3 usuários na fila");
        $this->command->info("  → OS#4 (ativa, team=1, start=2026-08-01) é o destino esperado");
        $this->command->info('');
        $this->command->info('Agora rode: php artisan queue:transfer-closed');
    }
}
