<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function __construct(private EvolutionService $evolutionService) {}

    public function createForTeam(int $teamId, string $type, string $message, bool $sendWhatsapp = false): Notification
    {
        $notification = Notification::create([
            'team_id' => $teamId,
            'type'    => $type,
            'message' => $message,
            'read'    => false,
        ]);

        if ($sendWhatsapp) {
            $trio = User::where('team_id', $teamId)
                ->where('role', 'trio')
                ->whereNotNull('phone')
                ->first();

            if ($trio) {
                $this->evolutionService->sendText($trio->phone, $message);
            }
        }

        return $notification;
    }

    public function createSystem(string $message, ?int $teamId = null): Notification
    {
        return Notification::create([
            'team_id' => $teamId,
            'type'    => 'sistema',
            'message' => $message,
            'read'    => false,
        ]);
    }
}
