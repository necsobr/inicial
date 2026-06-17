<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SpeakerResource;
use App\Models\Speaker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpeakerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Speaker::with('team');

        if (!$user->isAdmin()) {
            $query->where('team_id', $user->team_id);
        }

        return response()->json([
            'data' => SpeakerResource::collection($query->orderBy('date')->get()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'team_id' => ['required', 'exists:teams,id'],
        ]);

        $speaker = Speaker::create($data);

        return response()->json([
            'data' => new SpeakerResource($speaker->load('team')),
            'message' => 'Palestrante criado com sucesso.',
        ], 201);
    }

    public function show(Speaker $speaker): JsonResponse
    {
        return response()->json([
            'data' => new SpeakerResource($speaker->load('team')),
        ]);
    }

    public function update(Request $request, Speaker $speaker): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'date' => ['sometimes', 'date'],
            'team_id' => ['sometimes', 'exists:teams,id'],
        ]);

        $speaker->update($data);

        return response()->json([
            'data' => new SpeakerResource($speaker->fresh('team')),
            'message' => 'Palestrante atualizado com sucesso.',
        ]);
    }

    public function destroy(Speaker $speaker): JsonResponse
    {
        $speaker->delete();

        return response()->json(['message' => 'Palestrante removido com sucesso.']);
    }
}
