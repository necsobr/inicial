<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $team = Team::where('name', 'VP INSPIRE')->first();

        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'active' => true,
                'pending' => false,
            ]
        );

        User::updateOrCreate(
            ['email' => 'coordenador@aiprint.com'],
            [
                'name' => 'Coordenador VP INSPIRE',
                'password' => Hash::make('123456'),
                'role' => 'coordenador',
                'team_id' => $team?->id,
                'active' => true,
                'pending' => false,
            ]
        );

        User::updateOrCreate(
            ['email' => 'trio@aiprint.com'],
            [
                'name' => 'Trio VP INSPIRE',
                'password' => Hash::make('123456'),
                'role' => 'trio',
                'team_id' => $team?->id,
                'active' => true,
                'pending' => false,
            ]
        );

        User::updateOrCreate(
            ['email' => 'membro@aiprint.com'],
            [
                'name' => 'Membro VP INSPIRE',
                'password' => Hash::make('123456'),
                'role' => 'membro',
                'team_id' => $team?->id,
                'active' => true,
                'pending' => false,
            ]
        );

        User::updateOrCreate(
            ['email' => 'producao@aiprint.com'],
            [
                'name' => 'Equipe de Produção',
                'password' => Hash::make('123456'),
                'role' => 'producao',
                'active' => true,
                'pending' => false,
            ]
        );
    }
}
