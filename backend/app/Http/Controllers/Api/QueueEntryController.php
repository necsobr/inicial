<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\QueueEntry\StoreQueueEntryRequest;
use App\Http\Resources\QueueEntryResource;
use App\Models\QueueEntry;
use App\Models\ServiceOrder;
use App\Services\QueueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QueueEntryController extends Controller
{
    public function __construct(private QueueService $queueService) {}

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

    public function pay(QueueEntry $queueEntry): JsonResponse
    {
        $entry = $this->queueService->pay($queueEntry);

        return response()->json([
            'data' => new QueueEntryResource($entry),
            'message' => 'Pagamento confirmado com sucesso.',
        ]);
    }

    public function decline(QueueEntry $queueEntry): JsonResponse
    {
        $entry = $this->queueService->decline($queueEntry);

        return response()->json([
            'data' => new QueueEntryResource($entry),
            'message' => 'Entrada recusada. Próximo da fila foi notificado.',
        ]);
    }
}
