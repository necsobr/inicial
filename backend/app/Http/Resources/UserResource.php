<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'teamId' => $this->team_id,
            'phone' => $this->phone,
            'company' => $this->company,
            'active' => $this->active,
            'pending' => $this->pending,
            'groupCreationRequestId' => $this->group_creation_request_id,
            'team' => $this->whenLoaded('team', fn() => new TeamResource($this->team)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
