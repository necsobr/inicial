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
            'billingType' => $this->billing_type,
            'asaasPaymentId' => $this->asaas_payment_id,
            'asaasPaymentStatus' => $this->asaas_payment_status,
            'asaasBankSlipUrl' => $this->asaas_bank_slip_url,
            'asaasInvoiceUrl' => $this->asaas_invoice_url,
            'asaasPixQrcode' => $this->asaas_pix_qrcode,
            'asaasPixCopyPaste' => $this->asaas_pix_copy_paste,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
