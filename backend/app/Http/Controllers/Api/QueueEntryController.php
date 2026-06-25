<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\QueueEntry\StoreQueueEntryRequest;
use App\Http\Resources\QueueEntryResource;
use App\Models\QueueEntry;
use App\Models\ServiceOrder;
use App\Services\AsaasService;
use App\Services\QueueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QueueEntryController extends Controller
{
    public function __construct(
        private QueueService $queueService,
        private AsaasService $asaasService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = QueueEntry::with('serviceOrder', 'user');

        if ($request->has('service_order_id')) {
            $query->where('service_order_id', $request->service_order_id);
        } elseif (!$user->isAdmin()) {
            $query->whereHas('serviceOrder', fn($q) => $q->where('team_id', $user->team_id));
        }

        return response()->json([
            'data' => QueueEntryResource::collection($query->orderBy('position')->get()),
        ]);
    }

    public function store(StoreQueueEntryRequest $request): JsonResponse
    {
        $serviceOrder = ServiceOrder::findOrFail($request->service_order_id);

        $entry = $this->queueService->join($serviceOrder, $request->user(), $request->validated());

        return response()->json([
            'data' => new QueueEntryResource($entry->load('serviceOrder', 'user')),
            'message' => 'Entrada na fila realizada com sucesso.',
        ], 201);
    }

    public function pay(Request $request, QueueEntry $queueEntry): JsonResponse
    {
        $request->validate([
            'cpf_cnpj'     => ['required', 'string'],
            'billing_type' => ['required', 'in:PIX,BOLETO'],
            'phone'        => ['nullable', 'string'],
        ]);

        if (!$this->asaasService->isConfigured()) {
            return response()->json(['message' => 'Integração de pagamento não configurada.'], 422);
        }

        $serviceOrder = $queueEntry->serviceOrder;
        $user         = $request->user();

        $customer = $this->asaasService->createOrFindCustomer([
            'name'        => $queueEntry->name,
            'email'       => $user->email,
            'cpfCnpj'     => $request->cpf_cnpj,
            'mobilePhone' => $request->phone ?? $queueEntry->phone,
        ]);

        $charge = $this->asaasService->createCharge($customer['id'], [
            'billingType' => $request->billing_type,
            'value'       => (float) $serviceOrder->quota_price,
            'dueDate'     => now()->addDays(3)->toDateString(),
            'description' => "Patrocínio O.S. #{$serviceOrder->id} — {$queueEntry->company}",
        ]);

        $pixData = [];
        if ($request->billing_type === 'PIX') {
            $pixData = $this->asaasService->getPixQrCode($charge['id']);
        }

        $queueEntry->update([
            'cpf_cnpj'             => preg_replace('/\D/', '', $request->cpf_cnpj),
            'billing_type'         => $request->billing_type,
            'asaas_customer_id'    => $customer['id'],
            'asaas_payment_id'     => $charge['id'],
            'asaas_payment_status' => $charge['status'] ?? 'PENDING',
            'asaas_bank_slip_url'  => $charge['bankSlipUrl'] ?? null,
            'asaas_invoice_url'    => $charge['invoiceUrl'] ?? null,
            'asaas_pix_qrcode'    => $pixData['encodedImage'] ?? null,
            'asaas_pix_copy_paste' => $pixData['payload'] ?? null,
        ]);

        return response()->json([
            'data'    => new QueueEntryResource($queueEntry->fresh('serviceOrder')),
            'message' => 'Cobrança gerada com sucesso.',
        ]);
    }

    public function checkPaymentStatus(QueueEntry $queueEntry): JsonResponse
    {
        if (!$queueEntry->asaas_payment_id) {
            return response()->json(['asaasStatus' => 'PENDING', 'status' => $queueEntry->status]);
        }

        $asaasStatus = $this->asaasService->getPaymentStatus($queueEntry->asaas_payment_id);
        $queueEntry->update(['asaas_payment_status' => $asaasStatus]);

        if (in_array($asaasStatus, ['RECEIVED', 'CONFIRMED'])) {
            $this->queueService->pay($queueEntry);
        }

        return response()->json([
            'asaasStatus' => $asaasStatus,
            'status'      => $queueEntry->fresh()->status,
        ]);
    }

    public function decline(QueueEntry $queueEntry): JsonResponse
    {
        $entry = $this->queueService->decline($queueEntry);

        return response()->json([
            'data'    => new QueueEntryResource($entry),
            'message' => 'Entrada recusada. Próximo da fila foi notificado.',
        ]);
    }
}
