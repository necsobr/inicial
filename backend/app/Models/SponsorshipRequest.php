<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SponsorshipRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company', 'team_id', 'week', 'amount', 'status',
        'applicant_email', 'applicant_name', 'requested_at',
        'cpf_cnpj', 'phone', 'billing_type',
        'asaas_customer_id', 'asaas_payment_id', 'asaas_payment_status',
        'asaas_bank_slip_url', 'asaas_invoice_url',
        'asaas_pix_qrcode', 'asaas_pix_copy_paste',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'requested_at' => 'date'];
    }

    public function team() { return $this->belongsTo(Team::class); }
}
