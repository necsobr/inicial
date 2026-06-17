<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Event::with('team', 'serviceOrder', 'referenceMap');

        if (!$user->isAdmin()) {
            $query->where('team_id', $user->team_id);
        }

        return response()->json([
            'data' => EventResource::collection($query->orderBy('date')->get()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:reuniao,social,aniversario,outro'],
            'team_id' => ['required', 'exists:teams,id'],
            'service_order_id' => ['nullable', 'exists:service_orders,id'],
        ]);

        $event = Event::create($data);

        return response()->json([
            'data' => new EventResource($event->load('team', 'serviceOrder')),
            'message' => 'Evento criado com sucesso.',
        ], 201);
    }

    public function show(Event $event): JsonResponse
    {
        return response()->json([
            'data' => new EventResource($event->load('team', 'serviceOrder', 'referenceMap')),
        ]);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'date' => ['sometimes', 'date'],
            'time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:255'],
            'type' => ['sometimes', 'in:reuniao,social,aniversario,outro'],
            'team_id' => ['sometimes', 'exists:teams,id'],
            'service_order_id' => ['nullable', 'exists:service_orders,id'],
        ]);

        $event->update($data);

        return response()->json([
            'data' => new EventResource($event->fresh('team', 'serviceOrder')),
            'message' => 'Evento atualizado com sucesso.',
        ]);
    }

    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json(['message' => 'Evento removido com sucesso.']);
    }

    public function byTeam(Team $team): JsonResponse
    {
        $events = Event::with('serviceOrder', 'referenceMap')
            ->where('team_id', $team->id)
            ->orderBy('date')
            ->get();

        return response()->json([
            'data' => EventResource::collection($events),
        ]);
    }
}
