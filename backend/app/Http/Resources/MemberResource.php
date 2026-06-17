<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'company' => $this->company,
            'specialty' => $this->specialty,
            'contact' => $this->contact,
            'level' => $this->level,
            'teamId' => $this->team_id,
            'userId' => $this->user_id,
            'team' => $this->whenLoaded('team', fn() => new TeamResource($this->team)),
            'user' => $this->whenLoaded('user', fn() => $this->user ? new UserResource($this->user) : null),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
