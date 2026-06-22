<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\User;
use App\Services\EvolutionService;
use Illuminate\Console\Command;

class MapsReminderCommand extends Command
{
    protected $signature   = 'maps:remind';
    protected $description = 'Envia lembretes de upload de mapa de referência via WhatsApp';

    public function __construct(private EvolutionService $evolutionService) {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->remindCoordinators();
        $this->alertTrioForDelay();
    }

    // 3 dias antes → avisa o coordenador
    private function remindCoordinators(): void
    {
        $targetDate = now()->addDays(3)->toDateString();

        Event::whereDate('date', $targetDate)
            ->whereDoesntHave('referenceMap', fn($q) => $q->whereNotNull('file_path')->where('file_path', '!=', ''))
            ->with('team')
            ->get()
            ->each(function (Event $event) {
                User::where('team_id', $event->team_id)
                    ->where('role', 'coordenador')
                    ->whereNotNull('phone')
                    ->get()
                    ->each(fn(User $coord) => $this->evolutionService->sendText(
                        $coord->phone,
                        "Lembrete AIprint: A reuniao \"{$event->title}\" acontece em 3 dias ({$event->date->format('d/m/Y')}). Faca o upload do mapa de referencia em PDF no sistema antes do prazo."
                    ));
            });
    }

    // 1 dia antes → avisa o trio sobre atraso do coordenador
    private function alertTrioForDelay(): void
    {
        $targetDate = now()->addDay()->toDateString();

        Event::whereDate('date', $targetDate)
            ->whereDoesntHave('referenceMap', fn($q) => $q->whereNotNull('file_path')->where('file_path', '!=', ''))
            ->with('team')
            ->get()
            ->each(function (Event $event) {
                $trio = User::where('team_id', $event->team_id)
                    ->where('role', 'trio')
                    ->whereNotNull('phone')
                    ->first();

                if ($trio) {
                    $this->evolutionService->sendText(
                        $trio->phone,
                        "Atencao AIprint: O mapa de referencia da reuniao \"{$event->title}\" (amanha, {$event->date->format('d/m/Y')}) ainda nao foi enviado pelo coordenador."
                    );
                }
            });
    }
}
