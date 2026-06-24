<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\MessageTemplate;
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
        $template = MessageTemplate::where('key', 'lembrete_3_dias')->first();
        if (!$template) return;

        $targetDate = now()->addDays(3)->toDateString();

        Event::whereDate('date', $targetDate)
            ->whereDoesntHave('referenceMap', fn($q) => $q->whereNotNull('file_path')->where('file_path', '!=', ''))
            ->with('team')
            ->get()
            ->each(function (Event $event) use ($template) {
                $msg = str_replace(
                    ['{titulo}', '{data}'],
                    [$event->title, $event->date->format('d/m/Y')],
                    $template->body
                );

                User::where('team_id', $event->team_id)
                    ->where('role', 'coordenador')
                    ->whereNotNull('phone')
                    ->get()
                    ->each(fn(User $coord) => $this->evolutionService->sendText($coord->phone, $msg));
            });
    }

    // 1 dia antes → avisa o trio sobre atraso do coordenador
    private function alertTrioForDelay(): void
    {
        $template = MessageTemplate::where('key', 'alerta_1_dia')->first();
        if (!$template) return;

        $targetDate = now()->addDay()->toDateString();

        Event::whereDate('date', $targetDate)
            ->whereDoesntHave('referenceMap', fn($q) => $q->whereNotNull('file_path')->where('file_path', '!=', ''))
            ->with('team')
            ->get()
            ->each(function (Event $event) use ($template) {
                $trio = User::where('team_id', $event->team_id)
                    ->where('role', 'trio')
                    ->whereNotNull('phone')
                    ->first();

                if ($trio) {
                    $msg = str_replace(
                        ['{titulo}', '{data}'],
                        [$event->title, $event->date->format('d/m/Y')],
                        $template->body
                    );
                    $this->evolutionService->sendText($trio->phone, $msg);
                }
            });
    }
}
