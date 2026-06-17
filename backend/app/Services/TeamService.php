<?php

namespace App\Services;

use App\Models\GroupCreationRequest;
use App\Models\Team;
use App\Models\User;

class TeamService
{
    public function __construct(private NotificationService $notificationService) {}

    public function approveGroupCreation(GroupCreationRequest $gcr): Team
    {
        $team = Team::create([
            'name' => $gcr->group_name,
            'regional' => $gcr->regional,
            'city' => $gcr->city,
        ]);

        $gcr->update(['status' => 'aprovada']);

        if ($gcr->user_id) {
            $user = User::find($gcr->user_id);
            if ($user) {
                $user->update([
                    'role' => 'coordenador',
                    'team_id' => $team->id,
                    'active' => true,
                    'pending' => false,
                ]);

                $this->notificationService->createForTeam(
                    $team->id,
                    'sistema',
                    "Grupo {$team->name} aprovado! Bem-vindo à plataforma AIprint."
                );
            }
        }

        return $team;
    }

    public function rejectGroupCreation(GroupCreationRequest $gcr): void
    {
        $gcr->update(['status' => 'recusada']);

        if ($gcr->user_id) {
            $user = User::find($gcr->user_id);
            if ($user) {
                $user->update(['active' => false, 'pending' => false]);
            }
        }
    }
}
