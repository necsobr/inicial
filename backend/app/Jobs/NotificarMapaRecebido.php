<?php

namespace App\Jobs;

use App\Models\ReferenceMap;
use App\Models\User;
use App\Services\EvolutionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class NotificarMapaRecebido implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private ReferenceMap $referenceMap) {}

    public function handle(EvolutionService $evolution): void
    {
        $map    = $this->referenceMap->load('team', 'serviceOrder');
        $equipe = $map->team->name ?? 'Equipe';
        $papel  = $map->serviceOrder->paper_type ?? '';

        $producao = User::where('role', 'producao')->whereNotNull('phone')->get();

        foreach ($producao as $user) {
            $evolution->sendAutoMessage('mapaRecebido', $user->phone, [
                'equipe'      => $equipe,
                'papel'       => $papel,
                'dataEntrega' => $map->delivery_date?->format('d/m/Y') ?? '',
                'horaEntrega' => $map->delivery_time ?? '',
                'endereco'    => $map->delivery_address ?? '',
            ]);
        }
    }

    public static function dispatchComHorario(ReferenceMap $referenceMap): void
    {
        $agora = now()->setTimezone('America/Sao_Paulo');
        $inicio = $agora->copy()->setTime(9, 0, 0);
        $fim    = $agora->copy()->setTime(17, 0, 0);

        if ($agora->between($inicio, $fim)) {
            static::dispatch($referenceMap);
        } elseif ($agora->lt($inicio)) {
            static::dispatch($referenceMap)->delay($agora->diffInSeconds($inicio));
        } else {
            static::dispatch($referenceMap)->delay($agora->diffInSeconds($inicio->addDay()));
        }
    }
}
