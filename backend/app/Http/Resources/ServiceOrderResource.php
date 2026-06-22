<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'teamId' => $this->team_id,
            'name' => $this->name,
            'paperType' => $this->paper_type,
            'copies' => $this->copies,
            'recurrence' => $this->recurrence,
            'dayOfWeek' => $this->day_of_week,
            'singleDate' => $this->single_date?->toDateString(),
            'meetingsCount' => $this->meetings_count,
            'sponsorSlots' => $this->sponsor_slots,
            'quotaPrice' => (float) $this->quota_price,
            'startDate' => $this->start_date?->toDateString(),
            'status' => $this->status,
            'createdBy' => $this->created_by,
            'team' => $this->whenLoaded('team', fn() => new TeamResource($this->team)),
            'creator' => $this->whenLoaded('creator', fn() => new UserResource($this->creator)),
            'events' => $this->whenLoaded('events', fn() => EventResource::collection($this->events)),
            'queueEntries' => $this->whenLoaded('queueEntries', fn() => QueueEntryResource::collection($this->queueEntries)),
            'referenceMaps' => $this->whenLoaded('referenceMaps', fn() => ReferenceMapResource::collection($this->referenceMaps)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
