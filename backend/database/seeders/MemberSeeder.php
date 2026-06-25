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
            ['name' => 'Ana Souza',        'company' => 'Advocacia Souza',            'specialty' => 'Advocacia Trabalhista',    'contact' => '(12) 99999-0001', 'level' => 'Gold'],
            ['name' => 'Bruno Lima',        'company' => 'Lima Contabilidade',         'specialty' => 'Contabilidade',            'contact' => '(12) 99999-0002', 'level' => 'Silver'],
            ['name' => 'Carla Mendes',      'company' => 'Studio Carla Mendes',        'specialty' => 'Design Gráfico',           'contact' => '(12) 99999-0003', 'level' => 'Gold'],
            ['name' => 'Daniel Costa',      'company' => 'Costa Imóveis',              'specialty' => 'Imobiliária',              'contact' => '(12) 99999-0004', 'level' => 'Silver'],
            ['name' => 'Eduarda Ferreira',  'company' => 'Clínica Ferreira',           'specialty' => 'Odontologia',              'contact' => '(12) 99999-0005', 'level' => 'Platinum'],
            ['name' => 'Felipe Santos',     'company' => 'Santos TI',                  'specialty' => 'Tecnologia da Informação', 'contact' => '(12) 99999-0006', 'level' => 'Gold'],
            ['name' => 'Gabriela Oliveira', 'company' => 'GO Marketing',               'specialty' => 'Marketing Digital',        'contact' => '(12) 99999-0007', 'level' => 'Silver'],
            ['name' => 'Henrique Rocha',    'company' => 'Rocha Seguros',              'specialty' => 'Seguros',                  'contact' => '(12) 99999-0008', 'level' => 'Gold'],
            ['name' => 'Isabella Nunes',    'company' => 'Nunes RH',                   'specialty' => 'Recursos Humanos',         'contact' => '(12) 99999-0009', 'level' => 'Silver'],
            ['name' => 'João Pereira',      'company' => 'Pereira Engenharia',         'specialty' => 'Engenharia Civil',         'contact' => '(12) 99999-0010', 'level' => 'Platinum'],
            ['name' => 'Karen Alves',       'company' => 'Alves Arquitetura',          'specialty' => 'Arquitetura',              'contact' => '(12) 99999-0011', 'level' => 'Gold'],
            ['name' => 'Lucas Ribeiro',     'company' => 'Ribeiro Foto & Vídeo',       'specialty' => 'Fotografia e Vídeo',       'contact' => '(12) 99999-0012', 'level' => 'Silver'],
            ['name' => 'Marina Castro',     'company' => 'Nutri Castro',               'specialty' => 'Nutrição',                 'contact' => '(12) 99999-0013', 'level' => 'Gold'],
            ['name' => 'Nelson Dias',       'company' => 'Clínica Dias Fisio',         'specialty' => 'Fisioterapia',             'contact' => '(12) 99999-0014', 'level' => 'Silver'],
            ['name' => 'Olivia Barros',     'company' => 'Psicologia Barros',          'specialty' => 'Psicologia',               'contact' => '(12) 99999-0015', 'level' => 'Gold'],
            ['name' => 'Paulo Moraes',      'company' => 'Moraes Investimentos',       'specialty' => 'Consultoria Financeira',   'contact' => '(12) 99999-0016', 'level' => 'Platinum'],
            ['name' => 'Quésia Lima',       'company' => 'QL Eventos',                 'specialty' => 'Eventos e Cerimonial',     'contact' => '(12) 99999-0017', 'level' => 'Silver'],
            ['name' => 'Rafael Martins',    'company' => 'Martins Automação',          'specialty' => 'Automação Industrial',     'contact' => '(12) 99999-0018', 'level' => 'Gold'],
            ['name' => 'Sabrina Campos',    'company' => 'Studio Campos Beauty',       'specialty' => 'Estética e Beleza',        'contact' => '(12) 99999-0019', 'level' => 'Silver'],
            ['name' => 'Thiago Araújo',     'company' => 'Araújo Logística',           'specialty' => 'Logística e Transporte',   'contact' => '(12) 99999-0020', 'level' => 'Gold'],
            ['name' => 'Úrsula Fernandes',  'company' => 'Fernandes Traduções',        'specialty' => 'Tradução e Interpretação', 'contact' => '(12) 99999-0021', 'level' => 'Silver'],
            ['name' => 'Vinícius Correia',  'company' => 'VC Energia Solar',           'specialty' => 'Energia Solar',            'contact' => '(12) 99999-0022', 'level' => 'Gold'],
            ['name' => 'Wanessa Teixeira',  'company' => 'Teixeira Medicina do Trab.', 'specialty' => 'Medicina do Trabalho',     'contact' => '(12) 99999-0023', 'level' => 'Silver'],
            ['name' => 'Xavier Pinto',      'company' => 'Pinto Treinamentos',         'specialty' => 'Treinamentos Corporativos','contact' => '(12) 99999-0024', 'level' => 'Platinum'],
            ['name' => 'Yasmin Nogueira',   'company' => 'YN Coaching',                'specialty' => 'Coaching Executivo',       'contact' => '(12) 99999-0025', 'level' => 'Gold'],
        ];

        foreach ($members as $data) {
            Member::updateOrCreate(
                ['name' => $data['name'], 'team_id' => $team->id],
                array_merge($data, ['team_id' => $team->id])
            );
        }
    }
}
