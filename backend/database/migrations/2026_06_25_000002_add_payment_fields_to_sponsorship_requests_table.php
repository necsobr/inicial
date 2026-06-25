<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sponsorship_requests', function (Blueprint $table) {
            $table->string('cpf_cnpj')->nullable()->after('applicant_name');
            $table->string('phone')->nullable()->after('cpf_cnpj');
            $table->string('billing_type')->nullable()->after('phone'); // PIX, BOLETO
            $table->string('asaas_customer_id')->nullable()->after('billing_type');
            $table->string('asaas_payment_id')->nullable()->after('asaas_customer_id');
            $table->string('asaas_payment_status')->nullable()->after('asaas_payment_id');
            $table->string('asaas_bank_slip_url')->nullable()->after('asaas_payment_status');
            $table->string('asaas_invoice_url')->nullable()->after('asaas_bank_slip_url');
            $table->text('asaas_pix_qrcode')->nullable()->after('asaas_invoice_url');
            $table->text('asaas_pix_copy_paste')->nullable()->after('asaas_pix_qrcode');
        });
    }

    public function down(): void
    {
        Schema::table('sponsorship_requests', function (Blueprint $table) {
            $table->dropColumn([
                'cpf_cnpj', 'phone', 'billing_type',
                'asaas_customer_id', 'asaas_payment_id', 'asaas_payment_status',
                'asaas_bank_slip_url', 'asaas_invoice_url',
                'asaas_pix_qrcode', 'asaas_pix_copy_paste',
            ]);
        });
    }
};
