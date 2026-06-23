<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestAcessoSeeder extends Seeder
{
    public function run(): void
    {
        $team = Team::firstOrCreate(
            ['name' => 'VP INSPIRE'],
            ['regional' => 'Sudeste', 'city' => 'São Paulo']
        );

        $usuarios = [
            [
                'email' => 'admin@admin.com',
                'name'  => 'Administrador',
                'role'  => 'admin',
                'team'  => null,
            ],
            [
                'email' => 'coordenador@aiprint.com',
                'name'  => 'Coordenador VP INSPIRE',
                'role'  => 'coordenador',
                'team'  => $team->id,
            ],
            [
                'email' => 'trio@aiprint.com',
                'name'  => 'Trio VP INSPIRE',
                'role'  => 'trio',
                'team'  => $team->id,
            ],
            [
                'email' => 'membro@aiprint.com',
                'name'  => 'Membro VP INSPIRE',
                'role'  => 'membro',
                'team'  => $team->id,
            ],
            [
                'email' => 'producao@aiprint.com',
                'name'  => 'Equipe de Produção',
                'role'  => 'producao',
                'team'  => null,
            ],
        ];

        foreach ($usuarios as $u) {
            User::firstOrCreate(
                ['email' => $u['email']],
                [
                    'name'     => $u['name'],
                    'password' => Hash::make('123456'),
                    'role'     => $u['role'],
                    'team_id'  => $u['team'],
                    'active'   => true,
                    'pending'  => false,
                ]
            );
        }

        $this->command->info('');
        $this->command->info('╔═══════════════════════════════════════════════════════╗');
        $this->command->info('║             CREDENCIAIS DE TESTE — AIprint            ║');
        $this->command->info('╠═══════════════════════╦═══════════════╦═══════════════╣');
        $this->command->info('║ Papel                 ║ E-mail        ║ Senha         ║');
        $this->command->info('╠═══════════════════════╬═══════════════╬═══════════════╣');
        $this->command->info('║ Admin                 ║ admin@admin.com║ 123456        ║');
        $this->command->info('║ Coordenador           ║ coordenador@  ║ 123456        ║');
        $this->command->info('║                       ║ aiprint.com   ║               ║');
        $this->command->info('║ Trio                  ║ trio@         ║ 123456        ║');
        $this->command->info('║                       ║ aiprint.com   ║               ║');
        $this->command->info('║ Membro                ║ membro@       ║ 123456        ║');
        $this->command->info('║                       ║ aiprint.com   ║               ║');
        $this->command->info('║ Produção              ║ producao@     ║ 123456        ║');
        $this->command->info('║                       ║ aiprint.com   ║               ║');
        $this->command->info('╚═══════════════════════╩═══════════════╩═══════════════╝');
        $this->command->info('');
        $this->command->info('Acesso: /login → preencha e-mail + senha acima.');
        $this->command->info('Admin: /admin  |  Coordenador: /coordenador  |  Trio: /trio');
        $this->command->info('Membro: /membro  |  Produção: /producao');
        $this->command->info('');
    }
}
