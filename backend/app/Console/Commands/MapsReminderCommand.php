<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\QueueEntry;
use App\Models\User;
use App\Services\EvolutionService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class MapsReminderCommand extends Command
{
    protected $signature   = 'maps:remind';
    protected $description = 'Envia lembretes de mapa de referência e de patrocínio via WhatsApp';

    public function __construct(private EvolutionService $evolutionService) {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->remindCoordinators();
        $this->alertTrioForDelay();
        $this->remindSponsors();
    }

    // 3 dias antes → avisa coordenador se mapa não foi enviado
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
                    ->each(fn(User $coord) => $this->evolutionService->sendAutoMessage(
                        'lembreteMapa3dias',
                        $coord->phone,
                        ['nome' => $coord->name, 'data' => Carbon::parse($event->date)->format('d/m/Y'), 'evento' => $event->title]
                    ));
            });
    }

    // 1 dia antes → avisa trio se coordenador não enviou ainda
    private function alertTrioForDelay(): void
    {
        $targetDate = now()->addDay()->toDateString();

        Event::whereDate('date', $targetDate)
            ->whereDoesntHave('referenceMap', fn($q) => $q->whereNotNull('file_path')->where('file_path', '!=', ''))
            ->get()
            ->each(function (Event $event) {
                User::where('team_id', $event->team_id)
                    ->where('role', 'trio')
                    ->whereNotNull('phone')
                    ->get()
                    ->each(fn(User $trio) => $this->evolutionService->sendAutoMessage(
                        'lembreteMapa1dia',
                        $trio->phone,
                        ['nome' => $trio->name, 'data' => Carbon::parse($event->date)->format('d/m/Y'), 'evento' => $event->title]
                    ));
            });
    }

    // 1 dia antes → lembra patrocinadores confirmados
    private function remindSponsors(): void
    {
        $targetDate = now()->addDay()->toDateString();

        Event::whereDate('date', $targetDate)
            ->whereNotNull('service_order_id')
            ->get()
            ->each(function (Event $event) {
                QueueEntry::where('service_order_id', $event->service_order_id)
                    ->where('status', 'pago')
                    ->whereNotNull('phone')
                    ->get()
                    ->each(fn(QueueEntry $entry) => $this->evolutionService->sendAutoMessage(
                        'lembretePatrocinador',
                        $entry->phone,
                        ['nome' => $entry->name, 'data' => Carbon::parse($event->date)->format('d/m/Y'), 'local' => $event->location ?? 'a confirmar', 'evento' => $event->title]
                    ));
            });
    }
}
