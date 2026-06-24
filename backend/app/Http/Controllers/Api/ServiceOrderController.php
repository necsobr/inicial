<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceOrder\StoreServiceOrderRequest;
use App\Http\Resources\ServiceOrderResource;
use App\Models\ServiceOrder;
use App\Services\NotificationService;
use App\Services\QueueService;
use App\Services\ServiceOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceOrderController extends Controller
{
    public function __construct(
        private ServiceOrderService $serviceOrderService,
        private QueueService $queueService,
        private NotificationService $notificationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ServiceOrder::with('team', 'creator');

        if (!$user->isAdmin()) {
            $query->where('team_id', $user->team_id);
        }

        return response()->json([
            'data' => ServiceOrderResource::collection($query->latest()->get()),
        ]);
    }

    public function store(StoreServiceOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;

        $quotaPrice = $this->serviceOrderService->calculateQuotaPrice(
            $data['meetings_count'],
            $data['sponsor_slots']
        );
        $data['quota_price'] = $quotaPrice;

        $serviceOrder = ServiceOrder::create($data);

        $this->serviceOrderService->generateEvents($serviceOrder->load('team'));

        $this->notificationService->createForTeam(
            $serviceOrder->team_id,
            'sistema',
            "Nova O.S. #{$serviceOrder->id} criada para a equipe {$serviceOrder->team->name}.",
            true
        );

        return response()->json([
            'data' => new ServiceOrderResource($serviceOrder->fresh('team', 'creator', 'events')),
            'message' => 'Ordem de Serviço criada com sucesso.',
        ], 201);
    }

    public function show(ServiceOrder $serviceOrder): JsonResponse
    {
        return response()->json([
            'data' => new ServiceOrderResource(
                $serviceOrder->load('team', 'creator', 'events', 'queueEntries', 'referenceMaps')
            ),
        ]);
    }

    public function update(Request $request, ServiceOrder $serviceOrder): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:ativa,encerrada,cancelada'],
            'name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'paper_type' => ['sometimes', 'in:A4,A3'],
            'copies' => ['nullable', 'integer', 'min:1'],
        ]);

        $oldStatus = $serviceOrder->status;
        $serviceOrder->update($data);

        $newStatus = $serviceOrder->status;
        $closing = in_array($newStatus, ['encerrada', 'cancelada']);
        if ($closing && $oldStatus === 'ativa') {
            $this->queueService->transferOnClose($serviceOrder);
            $this->notificationService->createForTeam(
                $serviceOrder->team_id,
                'sistema',
                "O.S. #{$serviceOrder->id} foi {$newStatus}.",
                true
            );
        }

        return response()->json([
            'data' => new ServiceOrderResource($serviceOrder->fresh('team', 'creator')),
            'message' => 'Ordem de Serviço atualizada com sucesso.',
        ]);
    }

    public function destroy(ServiceOrder $serviceOrder): JsonResponse
    {
        $serviceOrder->delete();

        return response()->json(['message' => 'Ordem de Serviço removida com sucesso.']);
    }
}
