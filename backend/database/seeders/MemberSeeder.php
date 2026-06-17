<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\Team;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $team = Team::where('name', 'VP INSPIRE')->first();

        if (!$team) {
            return;
        }

        $members = [
            ['name' => 'Ana Souza', 'company' => 'Advocacia Souza', 'specialty' => 'Advocacia Trabalhista', 'contact' => '(12) 99999-0001', 'level' => 'Gold'],
            ['name' => 'Bruno Lima', 'company' => 'Lima Contabilidade', 'specialty' => 'Contabilidade', 'contact' => '(12) 99999-0002', 'level' => 'Silver'],
            ['name' => 'Carla Mendes', 'company' => 'Studio Carla Mendes', 'specialty' => 'Design Gráfico', 'contact' => '(12) 99999-0003', 'level' => 'Gold'],
            ['name' => 'Daniel Costa', 'company' => 'Costa Imóveis', 'specialty' => 'Imobiliária', 'contact' => '(12) 99999-0004', 'level' => 'Silver'],
            ['name' => 'Eduarda Ferreira', 'company' => 'Clínica Ferreira', 'specialty' => 'Odontologia', 'contact' => '(12) 99999-0005', 'level' => 'Platinum'],
            ['name' => 'Felipe Santos', 'company' => 'Santos TI', 'specialty' => 'Tecnologia da Informação', 'contact' => '(12) 99999-0006', 'level' => 'Gold'],
            ['name' => 'Gabriela Oliveira', 'company' => 'GO Marketing', 'specialty' => 'Marketing Digital', 'contact' => '(12) 99999-0007', 'level' => 'Silver'],
            ['name' => 'Henrique Rocha', 'company' => 'Rocha Seguros', 'specialty' => 'Seguros', 'contact' => '(12) 99999-0008', 'level' => 'Gold'],
            ['name' => 'Isabella Nunes', 'company' => 'Nunes RH', 'specialty' => 'Recursos Humanos', 'contact' => '(12) 99999-0009', 'level' => 'Silver'],
            ['name' => 'João Pereira', 'company' => 'Pereira Engenharia', 'specialty' => 'Engenharia Civil', 'contact' => '(12) 99999-0010', 'level' => 'Platinum'],
        ];

        foreach ($members as $data) {
            Member::updateOrCreate(
                ['name' => $data['name'], 'team_id' => $team->id],
                array_merge($data, ['team_id' => $team->id])
            );
        }
    }
}
