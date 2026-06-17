<?php

namespace App\Services;

use App\Models\Event;
use App\Models\ServiceOrder;
use Carbon\Carbon;

class ServiceOrderService
{
    private const DAY_MAP = [
        'domingo' => Carbon::SUNDAY,
        'segunda' => Carbon::MONDAY,
        'terca' => Carbon::TUESDAY,
        'quarta' => Carbon::WEDNESDAY,
        'quinta' => Carbon::THURSDAY,
        'sexta' => Carbon::FRIDAY,
        'sabado' => Carbon::SATURDAY,
    ];

    public function calculateQuotaPrice(int $meetingsCount, int $sponsorSlots): float
    {
        if ($sponsorSlots <= 0) {
            return 0;
        }
        return ceil(($meetingsCount * 120) / $sponsorSlots);
    }

    public function generateEvents(ServiceOrder $serviceOrder): void
    {
        if ($serviceOrder->recurrence === 'unica') {
            $this->generateSingleEvent($serviceOrder);
            return;
        }

        $this->generateWeeklyEvents($serviceOrder);
    }

    private function generateSingleEvent(ServiceOrder $serviceOrder): void
    {
        $date = $serviceOrder->single_date ?? $serviceOrder->start_date;

        Event::create([
            'title' => 'Reunião Semanal — ' . $serviceOrder->team->name,
            'date' => $date,
            'type' => 'reuniao',
            'team_id' => $serviceOrder->team_id,
            'service_order_id' => $serviceOrder->id,
        ]);
    }

    private function generateWeeklyEvents(ServiceOrder $serviceOrder): void
    {
        $dayOfWeek = self::DAY_MAP[$serviceOrder->day_of_week] ?? Carbon::WEDNESDAY;
        $start = Carbon::parse($serviceOrder->start_date)->timezone('America/Sao_Paulo');

        // Avançar para o próximo dia da semana correto
        if ($start->dayOfWeek !== $dayOfWeek) {
            $start->next($dayOfWeek);
        }

        $count = $serviceOrder->meetings_count;
        $teamName = $serviceOrder->team->name;

        for ($i = 0; $i < $count; $i++) {
            $date = $start->copy()->addWeeks($i);

            Event::create([
                'title' => "Reunião Semanal — {$teamName}",
                'date' => $date->toDateString(),
                'type' => 'reuniao',
                'team_id' => $serviceOrder->team_id,
                'service_order_id' => $serviceOrder->id,
            ]);
        }
    }
}
