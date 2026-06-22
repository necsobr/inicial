<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ReferenceMapResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'teamId' => $this->team_id,
            'serviceOrderId' => $this->service_order_id,
            'eventId' => $this->event_id,
            'fileName' => $this->file_name,
            'fileUrl' => $this->file_path ? Storage::url($this->file_path) : null,
            'uploadDate' => $this->upload_date?->toDateString(),
            'deliveryDate' => $this->delivery_date?->toDateString(),
            'deliveryTime' => $this->delivery_time,
            'deliveryAddress' => $this->delivery_address,
            'status' => $this->status,
            'uploadedBy' => $this->uploaded_by,
            'team' => $this->whenLoaded('team', fn() => new TeamResource($this->team)),
            'serviceOrder' => $this->whenLoaded('serviceOrder', fn() => new ServiceOrderResource($this->serviceOrder)),
            'event' => $this->whenLoaded('event', fn() => new EventResource($this->event)),
            'uploader' => $this->whenLoaded('uploader', fn() => new UserResource($this->uploader)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
