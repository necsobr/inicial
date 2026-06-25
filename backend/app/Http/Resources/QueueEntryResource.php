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
            'billingType' => $this->billing_type,
            'asaasPaymentId' => $this->asaas_payment_id,
            'asaasPaymentStatus' => $this->asaas_payment_status,
            'asaasBankSlipUrl' => $this->asaas_bank_slip_url,
            'asaasInvoiceUrl' => $this->asaas_invoice_url,
            'asaasPixQrcode' => $this->asaas_pix_qrcode,
            'asaasPixCopyPaste' => $this->asaas_pix_copy_paste,
            'serviceOrder' => $this->whenLoaded('serviceOrder', fn() => new ServiceOrderResource($this->serviceOrder)),
            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
