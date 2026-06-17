<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        Team::updateOrCreate(
            ['name' => 'VP INSPIRE'],
            [
                'regional' => 'Regional Leste Paulista',
                'city' => 'São José dos Campos/SP',
                'total_members' => 25,
                'internal_refs' => 142,
                'external_refs' => 89,
                'meetings_1a1' => 318,
                'guests' => 47,
                'education' => 24,
                'total_business' => 3261522.00,
            ]
        );
    }
}
