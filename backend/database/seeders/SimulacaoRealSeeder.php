<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Member;
use App\Models\QueueEntry;
use App\Models\ReferenceMap;
use App\Models\ServiceOrder;
use App\Models\Speaker;
use App\Models\Team;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SimulacaoRealSeeder extends Seeder
{
    public function run(): void
    {
        // ── Equipes ────────────────────────────────────────────────────────

        // VP INSPIRE: apenas garante regional/city sem sobrescrever outros campos
        $inspire = Team::firstOrCreate(['name' => 'VP INSPIRE'], ['regional' => 'Sudeste', 'city' => 'São Paulo']);
        $inspire->regional = $inspire->regional ?: 'Sudeste';
        $inspire->city     = $inspire->city     ?: 'São Paulo';
        $inspire->save();

        $evolucao = Team::updateOrCreate(['name' => 'BNI EVOLUÇÃO'],  ['regional' => 'Sul',     'city' => 'Curitiba']);
        $conecta  = Team::updateOrCreate(['name' => 'BNI CONECTA'],   ['regional' => 'Sudeste', 'city' => 'Rio de Janeiro']);

        // ── Usuários de gestão ─────────────────────────────────────────────
        // Usuários base (coordenador/trio/producao da VP INSPIRE): apenas lê, não sobrescreve.

        $coordInspire = User::where('email', 'coordenador@aiprint.com')->first()
            ?? User::create(['email' => 'coordenador@aiprint.com', 'name' => 'Coordenador VP INSPIRE',
                             'password' => Hash::make('123456'), 'role' => 'coordenador',
                             'team_id' => $inspire->id, 'active' => true, 'pending' => false]);

        $trioInspire = User::where('email', 'trio@aiprint.com')->first()
            ?? User::create(['email' => 'trio@aiprint.com', 'name' => 'Trio VP INSPIRE',
                             'password' => Hash::make('123456'), 'role' => 'trio',
                             'team_id' => $inspire->id, 'active' => true, 'pending' => false]);

        $coordEvol = User::updateOrCreate(
            ['email' => 'coordenador.evolucao@aiprint.com'],
            ['name' => 'Fernanda Rocha', 'password' => Hash::make('123456'), 'role' => 'coordenador', 'team_id' => $evolucao->id, 'active' => true, 'pending' => false]
        );
        $trioEvol = User::updateOrCreate(
            ['email' => 'trio.evolucao@aiprint.com'],
            ['name' => 'Ricardo Mendes', 'password' => Hash::make('123456'), 'role' => 'trio', 'team_id' => $evolucao->id, 'active' => true, 'pending' => false]
        );

        $coordConecta = User::updateOrCreate(
            ['email' => 'coordenador.conecta@aiprint.com'],
            ['name' => 'Patrícia Lima', 'password' => Hash::make('123456'), 'role' => 'coordenador', 'team_id' => $conecta->id, 'active' => true, 'pending' => false]
        );
        $trioConecta = User::updateOrCreate(
            ['email' => 'trio.conecta@aiprint.com'],
            ['name' => 'André Souza', 'password' => Hash::make('123456'), 'role' => 'trio', 'team_id' => $conecta->id, 'active' => true, 'pending' => false]
        );

        // ── Membros ────────────────────────────────────────────────────────
        // Cada item: [nome, email, especialidade, empresa]

        $dadosInspire = [
            ['Vanessa Lopes',    'vanessa.lopes@aiprint.com',   'Advocacia',         'OAB-SP'],
            ['Carlos Eduardo',   'carlos.edu@aiprint.com',      'Contabilidade',     'CRC-SP'],
            ['Juliana Martins',  'juliana.martins@aiprint.com', 'Marketing Digital', 'Agência Pulse'],
            ['Roberto Silveira', 'roberto.silva@aiprint.com',   'Arquitetura',       'Studio RS'],
            ['Aline Ferreira',   'aline.ferreira@aiprint.com',  'RH Consultoria',    'People First'],
        ];

        $dadosEvol = [
            ['Beatriz Campos',  'beatriz.campos@aiprint.com',  'Nutrição',         'NutriVida'],
            ['Paulo Henrique',  'paulo.henrique@aiprint.com',  'Seguros',          'Seguro Total'],
            ['Camila Torres',   'camila.torres@aiprint.com',   'Fisioterapia',     'FisioAtiva'],
            ['Diego Alves',     'diego.alves@aiprint.com',     'Tecnologia',       'DevSolutions'],
            ['Gabriela Nunes',  'gabriela.nunes@aiprint.com',  'Imóveis',          'ImovBR'],
        ];

        $dadosConecta = [
            ['Thiago Costa',    'thiago.costa@aiprint.com',    'Odontologia',      'Clínica Oral'],
            ['Renata Barbosa',  'renata.barbosa@aiprint.com',  'Psicologia',       'Instituto Mente'],
            ['Gustavo Pires',   'gustavo.pires@aiprint.com',   'Engenharia Civil', 'GP Obras'],
            ['Larissa Santos',  'larissa.santos@aiprint.com',  'Fotografia',       'Studio L'],
            ['Marcelo Cunha',   'marcelo.cunha@aiprint.com',   'Advocacia',        'Cunha & Associados'],
        ];

        $membrosInspire  = $this->criarMembros($inspire,  $dadosInspire);
        $membrosEvol     = $this->criarMembros($evolucao, $dadosEvol);
        $membrosConecta  = $this->criarMembros($conecta,  $dadosConecta);

        // ── Ordens de Serviço ──────────────────────────────────────────────

        $osInspire = ServiceOrder::updateOrCreate(
            ['team_id' => $inspire->id, 'name' => 'Mapa Semanal VP INSPIRE'],
            ['paper_type' => 'A4', 'copies' => 18, 'recurrence' => 'semanal', 'day_of_week' => 'quarta',
             'meetings_count' => 0, 'sponsor_slots' => 3, 'quota_price' => 250.00,
             'start_date' => now()->startOfYear()->toDateString(), 'status' => 'ativa', 'created_by' => $coordInspire->id]
        );

        $osEvol = ServiceOrder::updateOrCreate(
            ['team_id' => $evolucao->id, 'name' => 'Mapa Semanal BNI EVOLUÇÃO'],
            ['paper_type' => 'A4', 'copies' => 15, 'recurrence' => 'semanal', 'day_of_week' => 'quinta',
             'meetings_count' => 0, 'sponsor_slots' => 2, 'quota_price' => 200.00,
             'start_date' => now()->startOfYear()->toDateString(), 'status' => 'ativa', 'created_by' => $coordEvol->id]
        );

        $osConecta = ServiceOrder::updateOrCreate(
            ['team_id' => $conecta->id, 'name' => 'Mapa Semanal BNI CONECTA'],
            ['paper_type' => 'A3', 'copies' => 12, 'recurrence' => 'semanal', 'day_of_week' => 'sexta',
             'meetings_count' => 0, 'sponsor_slots' => 2, 'quota_price' => 180.00,
             'start_date' => now()->startOfYear()->toDateString(), 'status' => 'ativa', 'created_by' => $coordConecta->id]
        );

        // ── Eventos (8 semanas) ────────────────────────────────────────────

        $eventosInspire = $this->criarEventos($inspire,  $osInspire,  'quarta', 8);
        $eventosEvol    = $this->criarEventos($evolucao, $osEvol,     'quinta',  8);
        $eventosConecta = $this->criarEventos($conecta,  $osConecta,  'sexta',   8);

        // ── Palestrantes ───────────────────────────────────────────────────

        $this->criarPalestrantes($inspire,  ['Vanessa Lopes',  'Carlos Eduardo',  'Juliana Martins',  'Roberto Silveira']);
        $this->criarPalestrantes($evolucao, ['Beatriz Campos', 'Paulo Henrique',  'Camila Torres',    'Diego Alves']);
        $this->criarPalestrantes($conecta,  ['Thiago Costa',   'Renata Barbosa',  'Gustavo Pires',    'Larissa Santos']);

        // ── Fila de patrocínio (VP INSPIRE) ───────────────────────────────

        $statusFila = ['pago', 'pago', 'confirmado', 'aguardando', 'aguardando'];
        foreach ($membrosInspire as $i => ['user' => $user, 'empresa' => $empresa]) {
            QueueEntry::updateOrCreate(
                ['service_order_id' => $osInspire->id, 'user_id' => $user->id],
                ['name' => $user->name, 'company' => $empresa, 'phone' => '(11) 98765-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                 'position' => $i + 1, 'status' => $statusFila[$i] ?? 'aguardando',
                 'joined_at' => now()->subWeeks(3)->addDays($i)]
            );
        }

        // ── Fila de patrocínio (BNI EVOLUÇÃO) ─────────────────────────────

        $statusFilaEvol = ['pago', 'confirmado', 'aguardando', 'aguardando', 'aguardando'];
        foreach ($membrosEvol as $i => ['user' => $user, 'empresa' => $empresa]) {
            QueueEntry::updateOrCreate(
                ['service_order_id' => $osEvol->id, 'user_id' => $user->id],
                ['name' => $user->name, 'company' => $empresa, 'phone' => '(41) 98765-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                 'position' => $i + 1, 'status' => $statusFilaEvol[$i] ?? 'aguardando',
                 'joined_at' => now()->subWeeks(2)->addDays($i)]
            );
        }

        // ── Mapas de referência ────────────────────────────────────────────

        $statusMapas = ['entregue', 'pronto', 'em_producao'];
        foreach (array_slice($eventosInspire, 0, 3) as $i => $evento) {
            ReferenceMap::updateOrCreate(
                ['event_id' => $evento->id],
                ['team_id' => $inspire->id, 'service_order_id' => $osInspire->id,
                 'file_name' => 'mapa_inspire_' . $evento->date->format('Ymd') . '.pdf',
                 'file_path' => 'reference-maps/mapa_inspire_' . $evento->date->format('Ymd') . '.pdf',
                 'upload_date' => $evento->date->copy()->subDays(3)->toDateString(),
                 'delivery_date' => $evento->date->copy()->subDay()->toDateString(),
                 'delivery_time' => '08:00', 'delivery_address' => 'Av. Paulista, 1000 — São Paulo/SP',
                 'uploaded_by' => $trioInspire->id, 'status' => $statusMapas[$i]]
            );
        }

        foreach (array_slice($eventosEvol, 0, 2) as $i => $evento) {
            ReferenceMap::updateOrCreate(
                ['event_id' => $evento->id],
                ['team_id' => $evolucao->id, 'service_order_id' => $osEvol->id,
                 'file_name' => 'mapa_evol_' . $evento->date->format('Ymd') . '.pdf',
                 'file_path' => 'reference-maps/mapa_evol_' . $evento->date->format('Ymd') . '.pdf',
                 'upload_date' => $evento->date->copy()->subDays(2)->toDateString(),
                 'delivery_date' => $evento->date->copy()->subDay()->toDateString(),
                 'delivery_time' => '09:00', 'delivery_address' => 'Rua XV de Novembro, 500 — Curitiba/PR',
                 'uploaded_by' => $trioEvol->id, 'status' => $i === 0 ? 'entregue' : 'pronto']
            );
        }

        $total = count($membrosInspire) + count($membrosEvol) + count($membrosConecta);
        $this->command->info('');
        $this->command->info('Simulacao real criada com sucesso!');
        $this->command->info('Equipes: VP INSPIRE | BNI EVOLUCAO | BNI CONECTA');
        $this->command->info('Membros com acesso: ' . $total);
        $this->command->info('Eventos gerados: ' . (count($eventosInspire) + count($eventosEvol) + count($eventosConecta)));
        $this->command->info('');
        $this->command->info('Logins extras (senha: 123456):');
        $this->command->info('  coordenador.evolucao@aiprint.com  -> Coordenador BNI EVOLUCAO');
        $this->command->info('  trio.evolucao@aiprint.com         -> Trio BNI EVOLUCAO');
        $this->command->info('  coordenador.conecta@aiprint.com   -> Coordenador BNI CONECTA');
        $this->command->info('  trio.conecta@aiprint.com          -> Trio BNI CONECTA');
        $this->command->info('  vanessa.lopes@aiprint.com         -> Membro VP INSPIRE');
        $this->command->info('');
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    /** @return array<int, array{user: User, especialidade: string, empresa: string}> */
    private function criarMembros(Team $team, array $dados): array
    {
        $resultado = [];
        foreach ($dados as $i => $d) {
            [$nome, $email, $especialidade, $empresa] = $d;

            $user = User::updateOrCreate(
                ['email' => $email],
                ['name' => $nome, 'password' => Hash::make('123456'), 'role' => 'membro',
                 'team_id' => $team->id, 'active' => true, 'pending' => false]
            );

            Member::updateOrCreate(
                ['team_id' => $team->id, 'name' => $nome],
                ['company' => $empresa, 'specialty' => $especialidade, 'contact' => $email,
                 'level' => $i === 0 ? 'ouro' : ($i === 1 ? 'prata' : 'membro')]
            );

            $resultado[] = ['user' => $user, 'especialidade' => $especialidade, 'empresa' => $empresa];
        }
        return $resultado;
    }

    private function criarEventos(Team $team, ServiceOrder $os, string $diaSemana, int $semanas): array
    {
        $diasMap = [
            'domingo' => Carbon::SUNDAY,  'segunda' => Carbon::MONDAY,   'terca'  => Carbon::TUESDAY,
            'quarta'  => Carbon::WEDNESDAY, 'quinta' => Carbon::THURSDAY, 'sexta'  => Carbon::FRIDAY,
            'sabado'  => Carbon::SATURDAY,
        ];

        $diaCarbonNum = $diasMap[$diaSemana] ?? Carbon::WEDNESDAY;
        $data = Carbon::now()->next($diaCarbonNum);
        $eventos = [];

        for ($i = 0; $i < $semanas; $i++) {
            $eventos[] = Event::updateOrCreate(
                ['team_id' => $team->id, 'date' => $data->toDateString(), 'service_order_id' => $os->id],
                ['title' => 'Reuniao Semanal — ' . $team->name, 'time' => '07:30',
                 'location' => $team->city ?? 'A definir', 'type' => 'reuniao']
            );
            $data = $data->copy()->addWeek();
        }

        return $eventos;
    }

    private function criarPalestrantes(Team $team, array $nomes): void
    {
        $data = Carbon::now()->next(Carbon::WEDNESDAY);
        foreach ($nomes as $nome) {
            Speaker::updateOrCreate(
                ['team_id' => $team->id, 'date' => $data->toDateString()],
                ['name' => $nome]
            );
            $data = $data->copy()->addWeek();
        }
    }
}
