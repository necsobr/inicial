<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'date' => $this->date?->toDateString(),
            'time' => $this->time,
            'location' => $this->location,
            'type' => $this->type,
            'teamId' => $this->team_id,
            'serviceOrderId' => $this->service_order_id,
            'team' => $this->whenLoaded('team', fn() => new TeamResource($this->team)),
            'serviceOrder' => $this->whenLoaded('serviceOrder', fn() => $this->serviceOrder ? new ServiceOrderResource($this->serviceOrder) : null),
            'referenceMap' => $this->whenLoaded('referenceMap', fn() => $this->referenceMap ? new ReferenceMapResource($this->referenceMap) : null),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
