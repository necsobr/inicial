<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    public function createForTeam(int $teamId, string $type, string $message): Notification
    {
        return Notification::create([
            'team_id' => $teamId,
            'type' => $type,
            'message' => $message,
            'read' => false,
        ]);
    }

    public function createSystem(string $message, ?int $teamId = null): Notification
    {
        return Notification::create([
            'team_id' => $teamId,
            'type' => 'sistema',
            'message' => $message,
            'read' => false,
        ]);
    }
}
