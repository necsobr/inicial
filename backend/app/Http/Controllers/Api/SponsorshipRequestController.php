<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SponsorshipRequestResource;
use App\Models\SponsorshipRequest;
use App\Services\AsaasService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SponsorshipRequestController extends Controller
{
    public function __construct(private AsaasService $asaasService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = SponsorshipRequest::with('team');

        if (!$user->isAdmin()) {
            $query->where('team_id', $user->team_id);
        }

        return response()->json([
            'data' => SponsorshipRequestResource::collection($query->latest()->get()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company'         => ['required', 'string', 'max:255'],
            'team_id'         => ['required', 'exists:teams,id'],
            'week'            => ['required', 'string'],
            'amount'          => ['required', 'numeric', 'min:0'],
            'applicant_email' => ['required', 'email'],
            'applicant_name'  => ['required', 'string', 'max:255'],
            'requested_at'    => ['required', 'date'],
            'cpf_cnpj'        => ['required', 'string', 'max:20'],
            'phone'           => ['nullable', 'string', 'max:20'],
            'billing_type'    => ['required', 'in:PIX,BOLETO'],
        ]);

        if (!$this->asaasService->isConfigured()) {
            return response()->json([
                'message' => 'Integração de pagamento não configurada. Acesse Configurações → Pagamentos e ative a integração.',
            ], 422);
        }

        try {
            $customer = $this->asaasService->createOrFindCustomer([
                'name'        => $data['applicant_name'],
                'email'       => $data['applicant_email'],
                'cpfCnpj'     => $data['cpf_cnpj'],
                'mobilePhone' => $data['phone'] ?? null,
            ]);

            $dueDate = now()->addDays(3)->format('Y-m-d');

            $charge = $this->asaasService->createCharge($customer['id'], [
                'billingType' => $data['billing_type'],
                'value'       => $data['amount'],
                'dueDate'     => $dueDate,
                'description' => "Patrocínio — {$data['company']} — Semana {$data['week']}",
            ]);

            $pixQrcode    = null;
            $pixCopyPaste = null;

            if ($data['billing_type'] === 'PIX') {
                $pixInfo      = $this->asaasService->getPixQrCode($charge['id']);
                $pixQrcode    = $pixInfo['encodedImage'] ?? null;
                $pixCopyPaste = $pixInfo['payload'] ?? null;
            }

            $sponsorship = SponsorshipRequest::create([
                'company'              => $data['company'],
                'team_id'              => $data['team_id'],
                'week'                 => $data['week'],
                'amount'               => $data['amount'],
                'status'               => 'aguardando_aprovacao',
                'applicant_email'      => $data['applicant_email'],
                'applicant_name'       => $data['applicant_name'],
                'requested_at'         => $data['requested_at'],
                'cpf_cnpj'             => preg_replace('/\D/', '', $data['cpf_cnpj']),
                'phone'                => $data['phone'] ?? null,
                'billing_type'         => $data['billing_type'],
                'asaas_customer_id'    => $customer['id'],
                'asaas_payment_id'     => $charge['id'],
                'asaas_payment_status' => $charge['status'] ?? 'PENDING',
                'asaas_bank_slip_url'  => $charge['bankSlipUrl'] ?? null,
                'asaas_invoice_url'    => $charge['invoiceUrl'] ?? null,
                'asaas_pix_qrcode'     => $pixQrcode,
                'asaas_pix_copy_paste' => $pixCopyPaste,
            ]);

            return response()->json([
                'data'    => new SponsorshipRequestResource($sponsorship->load('team')),
                'message' => 'Solicitação de patrocínio criada com sucesso.',
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Erro ao processar pagamento: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function show(SponsorshipRequest $sponsorshipRequest): JsonResponse
    {
        return response()->json([
            'data' => new SponsorshipRequestResource($sponsorshipRequest->load('team')),
        ]);
    }

    public function update(Request $request, SponsorshipRequest $sponsorshipRequest): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:aguardando_aprovacao,aprovada,recusada,concluida'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $sponsorshipRequest->update($data);

        return response()->json([
            'data'    => new SponsorshipRequestResource($sponsorshipRequest->fresh('team')),
            'message' => 'Solicitação de patrocínio atualizada com sucesso.',
        ]);
    }

    public function destroy(SponsorshipRequest $sponsorshipRequest): JsonResponse
    {
        $sponsorshipRequest->delete();

        return response()->json(['message' => 'Solicitação de patrocínio removida com sucesso.']);
    }

    public function checkPaymentStatus(SponsorshipRequest $sponsorshipRequest): JsonResponse
    {
        if (!$sponsorshipRequest->asaas_payment_id) {
            return response()->json(['asaasStatus' => null, 'status' => $sponsorshipRequest->status]);
        }

        $asaasStatus = $this->asaasService->getPaymentStatus($sponsorshipRequest->asaas_payment_id);

        $newStatus = $sponsorshipRequest->status;
        if (in_array($asaasStatus, ['RECEIVED', 'CONFIRMED']) && $sponsorshipRequest->status === 'aguardando_aprovacao') {
            $newStatus = 'aprovada';
        }

        $sponsorshipRequest->update([
            'asaas_payment_status' => $asaasStatus,
            'status'               => $newStatus,
        ]);

        return response()->json([
            'asaasStatus' => $asaasStatus,
            'status'      => $newStatus,
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        $event   = $request->input('event');
        $payment = $request->input('payment');

        if (in_array($event, ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']) && $payment) {
            $sponsorship = SponsorshipRequest::where('asaas_payment_id', $payment['id'])->first();
            if ($sponsorship && $sponsorship->status === 'aguardando_aprovacao') {
                $sponsorship->update([
                    'status'               => 'aprovada',
                    'asaas_payment_status' => $payment['status'] ?? 'RECEIVED',
                ]);
            }
        }

        return response()->json(['received' => true]);
    }
}
