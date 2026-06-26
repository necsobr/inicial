<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Member;
use App\Models\ServiceOrder;
use App\Models\Team;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GruposSeeder extends Seeder
{
    public function run(): void
    {
        $grupos = [
            [
                'team'   => ['name' => 'BNI LIDERANÇA',    'regional' => 'Regional Norte Paulista',  'city' => 'São Paulo/SP'],
                'slug'   => 'bnilideranca',
                'dia_os' => 'terca',
                'coord'  => ['nome' => 'Marcelo Andrade',   'empresa' => 'Andrade & Assoc.',      'especialidade' => 'Advocacia Empresarial'],
                'trio'   => [
                    ['nome' => 'Fernanda Lima',    'empresa' => 'Lima Contabilidade',    'especialidade' => 'Contabilidade'],
                    ['nome' => 'Ricardo Oliveira', 'empresa' => 'Pulse Marketing',       'especialidade' => 'Marketing Digital'],
                    ['nome' => 'Camila Santos',    'empresa' => 'Studio CS Arquitetura', 'especialidade' => 'Arquitetura'],
                ],
                'membros' => [
                    ['nome' => 'Beatriz Sousa',     'empresa' => 'BS Investimentos',        'especialidade' => 'Consultoria Financeira',   'level' => 'Gold'],
                    ['nome' => 'Thiago Correia',    'empresa' => 'Correia Imóveis',          'especialidade' => 'Imobiliária',              'level' => 'Silver'],
                    ['nome' => 'Juliana Moreira',   'empresa' => 'JM Seguros',               'especialidade' => 'Seguros de Vida',          'level' => 'Gold'],
                    ['nome' => 'Gustavo Pires',     'empresa' => 'NutriPires',               'especialidade' => 'Nutrição Clínica',         'level' => 'Silver'],
                    ['nome' => 'Larissa Campos',    'empresa' => 'Psicologia Campos',        'especialidade' => 'Psicologia',               'level' => 'Platinum'],
                    ['nome' => 'Bruno Teixeira',    'empresa' => 'TechBR Sistemas',          'especialidade' => 'Tecnologia da Informação', 'level' => 'Gold'],
                    ['nome' => 'Amanda Rocha',      'empresa' => 'Rocha Engenharia',         'especialidade' => 'Engenharia Civil',         'level' => 'Silver'],
                    ['nome' => 'Felipe Mendes',     'empresa' => 'Foto & Filmes Mendes',     'especialidade' => 'Fotografia e Vídeo',       'level' => 'Gold'],
                    ['nome' => 'Natália Freitas',   'empresa' => 'Clínica Freitas',          'especialidade' => 'Medicina do Trabalho',     'level' => 'Silver'],
                    ['nome' => 'Diego Albuquerque', 'empresa' => 'DA Interiores',            'especialidade' => 'Design de Interiores',    'level' => 'Gold'],
                    ['nome' => 'Priscila Vieira',   'empresa' => 'People RH',                'especialidade' => 'RH Estratégico',          'level' => 'Silver'],
                    ['nome' => 'Rafael Cunha',      'empresa' => 'SolarCunha Energia',       'especialidade' => 'Energia Solar',            'level' => 'Gold'],
                    ['nome' => 'Tatiane Barbosa',   'empresa' => 'Estética Tati',            'especialidade' => 'Estética e Beleza',        'level' => 'Silver'],
                    ['nome' => 'Anderson Lima',     'empresa' => 'Lima Logística',           'especialidade' => 'Logística e Transporte',  'level' => 'Platinum'],
                    ['nome' => 'Vanessa Nunes',     'empresa' => 'VN Eventos',               'especialidade' => 'Eventos e Cerimonial',    'level' => 'Gold'],
                    ['nome' => 'Caio Rezende',      'empresa' => 'Rezende Automação',        'especialidade' => 'Automação Industrial',    'level' => 'Silver'],
                ],
                'os' => [
                    ['name' => 'Mapa Semanal 2025', 'paper_type' => 'A4', 'copies' => 22, 'sponsor_slots' => 3, 'quota_price' => 250.00, 'start_date' => '2025-01-07'],
                    ['name' => 'Mapa Especial Junho', 'paper_type' => 'A3', 'copies' => 22, 'sponsor_slots' => 2, 'quota_price' => 350.00, 'start_date' => '2025-06-03', 'recurrence' => 'unica', 'single_date' => '2025-06-17'],
                ],
            ],
            [
                'team'   => ['name' => 'BNI CRESCIMENTO', 'regional' => 'Regional Vale do Paraíba', 'city' => 'São José dos Campos/SP'],
                'slug'   => 'bnicrescimento',
                'dia_os' => 'quarta',
                'coord'  => ['nome' => 'Patrícia Rocha',   'empresa' => 'Rocha Advocacia',        'especialidade' => 'Advocacia Trabalhista'],
                'trio'   => [
                    ['nome' => 'Carlos Mendes',    'empresa' => 'Mendes Auditoria',      'especialidade' => 'Auditoria Fiscal'],
                    ['nome' => 'Aline Ferreira',   'empresa' => 'AF Branding',           'especialidade' => 'Branding & Design'],
                    ['nome' => 'Renato Castro',    'empresa' => 'Castro Urbanismo',      'especialidade' => 'Urbanismo'],
                ],
                'membros' => [
                    ['nome' => 'Luciana Torres',    'empresa' => 'Torres Investimentos',    'especialidade' => 'Gestão de Investimentos',  'level' => 'Gold'],
                    ['nome' => 'Eduardo Gomes',     'empresa' => 'Gomes Avaliações',        'especialidade' => 'Avaliação de Imóveis',    'level' => 'Silver'],
                    ['nome' => 'Mariana Fonseca',   'empresa' => 'Fonseca Seguros',         'especialidade' => 'Seguros Empresariais',     'level' => 'Platinum'],
                    ['nome' => 'Rodrigo Leal',      'empresa' => 'FisioLeal',               'especialidade' => 'Fisioterapia',             'level' => 'Gold'],
                    ['nome' => 'Daniela Braga',     'empresa' => 'Coaching Braga',          'especialidade' => 'Coaching Executivo',       'level' => 'Silver'],
                    ['nome' => 'Leandro Matos',     'empresa' => 'MatosDev',                'especialidade' => 'Desenvolvimento Web',      'level' => 'Gold'],
                    ['nome' => 'Simone Araújo',     'empresa' => 'Araújo Elétrica',         'especialidade' => 'Engenharia Elétrica',      'level' => 'Silver'],
                    ['nome' => 'Henrique Novaes',   'empresa' => 'Novaes Produções',        'especialidade' => 'Produção Audiovisual',     'level' => 'Gold'],
                    ['nome' => 'Cláudia Ribeiro',   'empresa' => 'Odonto Ribeiro',          'especialidade' => 'Odontologia',              'level' => 'Silver'],
                    ['nome' => 'Fábio Monteiro',    'empresa' => 'Monteiro Paisagismo',     'especialidade' => 'Paisagismo',               'level' => 'Gold'],
                    ['nome' => 'Letícia Carvalho',  'empresa' => 'LC Recrutamento',         'especialidade' => 'Recrutamento e Seleção',  'level' => 'Silver'],
                    ['nome' => 'Maurício Dias',     'empresa' => 'Dias Transportes',        'especialidade' => 'Transporte de Cargas',    'level' => 'Platinum'],
                    ['nome' => 'Cristina Medeiros', 'empresa' => 'Clínica Medeiros',        'especialidade' => 'Dermatologia',             'level' => 'Gold'],
                    ['nome' => 'Álvaro Queiroz',    'empresa' => 'Queiroz Treinamentos',    'especialidade' => 'Treinamentos Corporativos','level' => 'Silver'],
                    ['nome' => 'Sabrina Pinheiro',  'empresa' => 'Pinheiro Gastronomia',    'especialidade' => 'Gastronomia e Catering',  'level' => 'Gold'],
                    ['nome' => 'Tiago Macedo',      'empresa' => 'Macedo Contabilidade',    'especialidade' => 'Planejamento Tributário', 'level' => 'Silver'],
                ],
                'os' => [
                    ['name' => 'Mapa Semanal 2025', 'paper_type' => 'A4', 'copies' => 20, 'sponsor_slots' => 3, 'quota_price' => 220.00, 'start_date' => '2025-01-08'],
                    ['name' => 'Mapa Aniversário BNI', 'paper_type' => 'A3', 'copies' => 20, 'sponsor_slots' => 4, 'quota_price' => 400.00, 'start_date' => '2025-05-07', 'recurrence' => 'unica', 'single_date' => '2025-05-28'],
                ],
            ],
            [
                'team'   => ['name' => 'BNI SUCESSO',     'regional' => 'Regional Campinas',        'city' => 'Campinas/SP'],
                'slug'   => 'bnisucesso',
                'dia_os' => 'quinta',
                'coord'  => ['nome' => 'André Costa',      'empresa' => 'Costa & Advogados',      'especialidade' => 'Advocacia Imobiliária'],
                'trio'   => [
                    ['nome' => 'Beatriz Alves',    'empresa' => 'Alves Contábil',        'especialidade' => 'Planejamento Contábil'],
                    ['nome' => 'Sérgio Barros',    'empresa' => 'Barros Marketing',      'especialidade' => 'Growth Marketing'],
                    ['nome' => 'Monique Duarte',   'empresa' => 'Duarte Arquitetura',    'especialidade' => 'Arquitetura Corporativa'],
                ],
                'membros' => [
                    ['nome' => 'Celso Guimarães',   'empresa' => 'Guimarães Previdência',   'especialidade' => 'Previdência Privada',     'level' => 'Gold'],
                    ['nome' => 'Isabela Moura',     'empresa' => 'Moura Gestão',             'especialidade' => 'Administração de Cond.', 'level' => 'Silver'],
                    ['nome' => 'Márcio Fleury',     'empresa' => 'Fleury Saúde',             'especialidade' => 'Planos de Saúde',         'level' => 'Platinum'],
                    ['nome' => 'Adriana Cardoso',   'empresa' => 'Studio Adriana',           'especialidade' => 'Estética e Beleza',       'level' => 'Gold'],
                    ['nome' => 'Flávia Nascimento', 'empresa' => 'Coach Flávia',             'especialidade' => 'Desenvolvimento Pessoal', 'level' => 'Silver'],
                    ['nome' => 'Elton Pacheco',     'empresa' => 'Pacheco Sistemas',         'especialidade' => 'Suporte de TI',           'level' => 'Gold'],
                    ['nome' => 'Soraya Prado',      'empresa' => 'Prado Ambiental',          'especialidade' => 'Engenharia Ambiental',    'level' => 'Silver'],
                    ['nome' => 'Júnior Assis',      'empresa' => 'Assis Filmes',             'especialidade' => 'Edição de Vídeo',         'level' => 'Gold'],
                    ['nome' => 'Mirella Cunha',     'empresa' => 'Clínica Estética Mirella', 'especialidade' => 'Medicina Estética',       'level' => 'Silver'],
                    ['nome' => 'Cássio Lopes',      'empresa' => 'Lopes Paisagismo',         'especialidade' => 'Paisagismo Urbano',       'level' => 'Gold'],
                    ['nome' => 'Heloísa Melo',      'empresa' => 'Melo Talentos',            'especialidade' => 'Gestão de Talentos',      'level' => 'Silver'],
                    ['nome' => 'Nilton Braga',      'empresa' => 'Braga Cargas',             'especialidade' => 'Transporte de Cargas',    'level' => 'Platinum'],
                    ['nome' => 'Regiane Porto',     'empresa' => 'Odonto Porto',             'especialidade' => 'Odontologia Estética',    'level' => 'Gold'],
                    ['nome' => 'Wálter Neves',      'empresa' => 'Neves Engenharia',         'especialidade' => 'Engenharia Mecânica',     'level' => 'Silver'],
                    ['nome' => 'Tatiana Sobral',    'empresa' => 'Sobral Eventos',           'especialidade' => 'Organização de Eventos',  'level' => 'Gold'],
                    ['nome' => 'Giovani Ramos',     'empresa' => 'SolarRamos',               'especialidade' => 'Energia Fotovoltaica',    'level' => 'Silver'],
                ],
                'os' => [
                    ['name' => 'Mapa Semanal 2025', 'paper_type' => 'A4', 'copies' => 21, 'sponsor_slots' => 3, 'quota_price' => 230.00, 'start_date' => '2025-01-09'],
                    ['name' => 'Mapa Especial Maio', 'paper_type' => 'A4', 'copies' => 21, 'sponsor_slots' => 2, 'quota_price' => 280.00, 'start_date' => '2025-05-01', 'recurrence' => 'unica', 'single_date' => '2025-05-22'],
                ],
            ],
        ];

        foreach ($grupos as $config) {
            $team = Team::updateOrCreate(
                ['name' => $config['team']['name']],
                array_merge($config['team'], [
                    'internal_refs' => rand(80, 160),
                    'external_refs' => rand(50, 100),
                    'meetings_1a1'  => rand(200, 400),
                    'guests'        => rand(30, 60),
                    'education'     => rand(20, 40),
                    'total_business'=> rand(1500000, 4000000) / 100,
                ])
            );

            $slug = $config['slug'];

            // ── Coordenador ────────────────────────────────────────────────

            $coord = User::updateOrCreate(
                ['email' => "coordenador@{$slug}.com"],
                [
                    'name'     => $config['coord']['nome'],
                    'password' => Hash::make('123456'),
                    'role'     => 'coordenador',
                    'team_id'  => $team->id,
                    'company'  => $config['coord']['empresa'],
                    'phone'    => '(11) 9' . rand(6000, 9999) . '-' . rand(1000, 9999),
                    'active'   => true,
                    'pending'  => false,
                ]
            );

            Member::updateOrCreate(
                ['name' => $config['coord']['nome'], 'team_id' => $team->id],
                ['company' => $config['coord']['empresa'], 'specialty' => $config['coord']['especialidade'],
                 'contact' => $coord->phone, 'level' => 'Gold', 'user_id' => $coord->id]
            );

            // ── Trio ───────────────────────────────────────────────────────

            $trioUsers = [];
            foreach ($config['trio'] as $i => $trioData) {
                $n = $i + 1;
                $user = User::updateOrCreate(
                    ['email' => "trio{$n}@{$slug}.com"],
                    [
                        'name'     => $trioData['nome'],
                        'password' => Hash::make('123456'),
                        'role'     => 'trio',
                        'team_id'  => $team->id,
                        'company'  => $trioData['empresa'],
                        'phone'    => '(11) 9' . rand(6000, 9999) . '-' . rand(1000, 9999),
                        'active'   => true,
                        'pending'  => false,
                    ]
                );

                Member::updateOrCreate(
                    ['name' => $trioData['nome'], 'team_id' => $team->id],
                    ['company' => $trioData['empresa'], 'specialty' => $trioData['especialidade'],
                     'contact' => $user->phone, 'level' => 'Silver', 'user_id' => $user->id]
                );

                $trioUsers[] = $user;
            }

            // ── Membros ────────────────────────────────────────────────────

            foreach ($config['membros'] as $i => $membroData) {
                $n = $i + 1;
                $user = User::updateOrCreate(
                    ['email' => "membro{$n}@{$slug}.com"],
                    [
                        'name'     => $membroData['nome'],
                        'password' => Hash::make('123456'),
                        'role'     => 'membro',
                        'team_id'  => $team->id,
                        'company'  => $membroData['empresa'],
                        'phone'    => '(11) 9' . rand(6000, 9999) . '-' . rand(1000, 9999),
                        'active'   => true,
                        'pending'  => false,
                    ]
                );

                Member::updateOrCreate(
                    ['name' => $membroData['nome'], 'team_id' => $team->id],
                    ['company' => $membroData['empresa'], 'specialty' => $membroData['especialidade'],
                     'contact' => $user->phone, 'level' => $membroData['level'], 'user_id' => $user->id]
                );
            }

            $totalMembros = 1 + count($config['trio']) + count($config['membros']);
            $team->update(['total_members' => $totalMembros]);

            // ── Ordens de Serviço ──────────────────────────────────────────

            foreach ($config['os'] as $osData) {
                $recurrence = $osData['recurrence'] ?? 'semanal';
                $isSemanal  = $recurrence === 'semanal';

                $os = ServiceOrder::updateOrCreate(
                    ['team_id' => $team->id, 'name' => $osData['name']],
                    [
                        'paper_type'     => $osData['paper_type'],
                        'copies'         => $osData['copies'],
                        'recurrence'     => $recurrence,
                        'day_of_week'    => $isSemanal ? $config['dia_os'] : null,
                        'single_date'    => !$isSemanal ? ($osData['single_date'] ?? null) : null,
                        'meetings_count' => $isSemanal ? 0 : 1,
                        'sponsor_slots'  => $osData['sponsor_slots'],
                        'quota_price'    => $osData['quota_price'],
                        'start_date'     => $osData['start_date'],
                        'status'         => 'ativa',
                        'created_by'     => $coord->id,
                    ]
                );

                if ($isSemanal) {
                    $this->criarEventos($team, $os, $config['dia_os'], 8);
                } else {
                    $dataEvento = $osData['single_date'] ?? $osData['start_date'];
                    Event::updateOrCreate(
                        ['team_id' => $team->id, 'date' => $dataEvento, 'service_order_id' => $os->id],
                        ['title' => $osData['name'] . ' — ' . $team->name,
                         'time' => '07:30', 'location' => $team->city, 'type' => 'reuniao']
                    );
                }
            }
        }
    }

    private function criarEventos(Team $team, ServiceOrder $os, string $diaSemana, int $semanas): void
    {
        $diasMap = [
            'segunda' => Carbon::MONDAY, 'terca'  => Carbon::TUESDAY,  'quarta' => Carbon::WEDNESDAY,
            'quinta'  => Carbon::THURSDAY, 'sexta' => Carbon::FRIDAY,
        ];

        $data = Carbon::now()->next($diasMap[$diaSemana] ?? Carbon::WEDNESDAY);

        for ($i = 0; $i < $semanas; $i++) {
            Event::updateOrCreate(
                ['team_id' => $team->id, 'date' => $data->toDateString(), 'service_order_id' => $os->id],
                ['title' => 'Reunião Semanal — ' . $team->name, 'time' => '07:30',
                 'location' => $team->city, 'type' => 'reuniao']
            );
            $data = $data->copy()->addWeek();
        }
    }
}
