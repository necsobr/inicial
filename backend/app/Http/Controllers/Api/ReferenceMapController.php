<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReferenceMap\StoreReferenceMapRequest;
use App\Http\Resources\ReferenceMapResource;
use App\Models\Event;
use App\Models\ReferenceMap;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferenceMapController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ReferenceMap::with('team', 'serviceOrder', 'event', 'uploader');

        if (!$user->isAdmin()) {
            $query->where('team_id', $user->team_id);
        }

        return response()->json([
            'data' => ReferenceMapResource::collection($query->latest()->get()),
        ]);
    }

    public function store(StoreReferenceMapRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['uploaded_by'] = $request->user()->id;
        $data['upload_date'] = now()->toDateString();

        // Valida que delivery_date está entre 3 e 1 dias antes do evento
        $event = Event::findOrFail($data['event_id']);
        $eventDate = Carbon::parse($event->date);
        $deliveryDate = Carbon::parse($data['delivery_date']);

        $diffDays = $eventDate->diffInDays($deliveryDate, false);

        if ($diffDays < 1 || $diffDays > 3) {
            return response()->json([
                'message' => 'Dados inválidos.',
                'errors' => [
                    'delivery_date' => ['A data de entrega deve ser entre 3 e 1 dias antes do evento.'],
                ],
            ], 422);
        }

        $map = ReferenceMap::create($data);

        return response()->json([
            'data' => new ReferenceMapResource($map->load('team', 'serviceOrder', 'event', 'uploader')),
            'message' => 'Mapa de referência criado com sucesso.',
        ], 201);
    }

    public function show(ReferenceMap $referenceMap): JsonResponse
    {
        return response()->json([
            'data' => new ReferenceMapResource($referenceMap->load('team', 'serviceOrder', 'event', 'uploader')),
        ]);
    }

    public function update(Request $request, ReferenceMap $referenceMap): JsonResponse
    {
        $data = $request->validate([
            'file_name' => ['sometimes', 'string'],
            'delivery_date' => ['sometimes', 'date'],
            'delivery_time' => ['sometimes', 'date_format:H:i'],
            'delivery_address' => ['nullable', 'string'],
        ]);

        $referenceMap->update($data);

        return response()->json([
            'data' => new ReferenceMapResource($referenceMap->fresh('team', 'serviceOrder', 'event', 'uploader')),
            'message' => 'Mapa de referência atualizado com sucesso.',
        ]);
    }

    public function destroy(ReferenceMap $referenceMap): JsonResponse
    {
        $referenceMap->delete();

        return response()->json(['message' => 'Mapa de referência removido com sucesso.']);
    }
}
