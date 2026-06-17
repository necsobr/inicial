<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrintRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'teamId' => $this->team_id,
            'requesterEmail' => $this->requester_email,
            'requesterName' => $this->requester_name,
            'quantity' => $this->quantity,
            'eventDate' => $this->event_date?->toDateString(),
            'notes' => $this->notes,
            'status' => $this->status,
            'team' => $this->whenLoaded('team', fn() => new TeamResource($this->team)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
