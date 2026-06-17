<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'teamId' => $this->team_id,
            'phone' => $this->phone,
            'status' => $this->status,
            'requestedAt' => $this->requested_at?->toDateString(),
            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'team' => $this->whenLoaded('team', fn() => new TeamResource($this->team)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
