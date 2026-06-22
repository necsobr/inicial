<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GroupCreationRequestResource;
use App\Http\Resources\TeamResource;
use App\Http\Resources\UserResource;
use App\Models\GroupCreationRequest;
use App\Models\User;
use App\Services\TeamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupCreationRequestController extends Controller
{
    public function __construct(private TeamService $teamService) {}

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $requests = GroupCreationRequest::with('user')->latest()->get();

        return response()->json([
            'data' => GroupCreationRequestResource::collection($requests),
        ]);
    }

    public function approve(Request $request, GroupCreationRequest $groupCreationRequest): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        if ($groupCreationRequest->status !== 'pendente') {
            return response()->json(['message' => 'Esta solicitação já foi processada.'], 422);
        }

        $team = $this->teamService->approveGroupCreation($groupCreationRequest);
        $user = User::find($groupCreationRequest->user_id);

        return response()->json([
            'data' => [
                'team' => new TeamResource($team),
                'user' => new UserResource($user),
            ],
            'message' => "Grupo '{$team->name}' aprovado e criado com sucesso.",
        ]);
    }

    public function reject(Request $request, GroupCreationRequest $groupCreationRequest): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        if ($groupCreationRequest->status !== 'pendente') {
            return response()->json(['message' => 'Esta solicitação já foi processada.'], 422);
        }

        $this->teamService->rejectGroupCreation($groupCreationRequest);

        return response()->json([
            'data' => new GroupCreationRequestResource($groupCreationRequest->fresh('user')),
            'message' => 'Solicitação de criação de grupo recusada.',
        ]);
    }
}
