<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'regional' => $this->regional,
            'city' => $this->city,
            'totalMembers' => $this->total_members,
            'internalRefs' => $this->internal_refs,
            'externalRefs' => $this->external_refs,
            'meetings1a1' => $this->meetings_1a1,
            'guests' => $this->guests,
            'education' => $this->education,
            'totalBusiness' => (float) $this->total_business,
            'members' => $this->whenLoaded('members', fn() => MemberResource::collection($this->members)),
            'users' => $this->whenLoaded('users', fn() => UserResource::collection($this->users)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
