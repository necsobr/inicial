<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QueueEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'serviceOrderId' => $this->service_order_id,
            'userId' => $this->user_id,
            'name' => $this->name,
            'company' => $this->company,
            'phone' => $this->phone,
            'position' => $this->position,
            'status' => $this->status,
            'joinedAt' => $this->joined_at?->toISOString(),
            'expiresAt' => $this->expires_at?->toISOString(),
            'serviceOrder' => $this->whenLoaded('serviceOrder', fn() => new ServiceOrderResource($this->serviceOrder)),
            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
