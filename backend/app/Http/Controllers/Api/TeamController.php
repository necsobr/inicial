<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index(): JsonResponse
    {
        $teams = Team::withCount('members')->get();

        return response()->json([
            'data' => TeamResource::collection($teams),
        ]);
    }

    public function store(StoreTeamRequest $request): JsonResponse
    {
        $team = Team::create($request->validated());

        return response()->json([
            'data' => new TeamResource($team),
            'message' => 'Equipe criada com sucesso.',
        ], 201);
    }

    public function show(Team $team): JsonResponse
    {
        return response()->json([
            'data' => new TeamResource($team->load(['members', 'users'])),
        ]);
    }

    public function update(StoreTeamRequest $request, Team $team): JsonResponse
    {
        $team->update($request->validated());

        return response()->json([
            'data' => new TeamResource($team->fresh()),
            'message' => 'Equipe atualizada com sucesso.',
        ]);
    }

    public function destroy(Team $team): JsonResponse
    {
        $team->delete();

        return response()->json(['message' => 'Equipe removida com sucesso.']);
    }

    public function myTeam(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->team_id) {
            return response()->json(['data' => null, 'message' => 'Usuário não está em nenhuma equipe.']);
        }

        $team = Team::with(['members', 'users'])->findOrFail($user->team_id);

        return response()->json([
            'data' => new TeamResource($team),
        ]);
    }
}
