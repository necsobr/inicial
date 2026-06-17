<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SponsorshipRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company' => $this->company,
            'teamId' => $this->team_id,
            'week' => $this->week,
            'amount' => (float) $this->amount,
            'status' => $this->status,
            'applicantEmail' => $this->applicant_email,
            'applicantName' => $this->applicant_name,
            'requestedAt' => $this->requested_at?->toDateString(),
            'team' => $this->whenLoaded('team', fn() => new TeamResource($this->team)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
