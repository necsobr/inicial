<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupCreationRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'requesterName' => $this->requester_name,
            'requesterEmail' => $this->requester_email,
            'phone' => $this->phone,
            'company' => $this->company,
            'groupName' => $this->group_name,
            'regional' => $this->regional,
            'city' => $this->city,
            'requestedAt' => $this->requested_at?->toDateString(),
            'status' => $this->status,
            'user' => $this->whenLoaded('user', fn() => $this->user ? new UserResource($this->user) : null),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
