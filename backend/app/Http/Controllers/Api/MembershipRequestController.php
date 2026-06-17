<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MembershipRequestResource;
use App\Models\MembershipRequest;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipRequestController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = MembershipRequest::with('user', 'team');

        if ($user->isAdmin()) {
            // Admin vê todas
        } elseif ($user->isCoordenador() || $user->isTrio()) {
            $query->where('team_id', $user->team_id);
        } else {
            $query->where('user_id', $user->id);
        }

        return response()->json([
            'data' => MembershipRequestResource::collection($query->latest()->get()),
        ]);
    }

    public function accept(MembershipRequest $membershipRequest): JsonResponse
    {
        $membershipRequest->update(['status' => 'aceita']);

        $user = $membershipRequest->user;
        $user->update([
            'team_id' => $membershipRequest->team_id,
            'active' => true,
            'pending' => false,
        ]);

        $this->notificationService->createForTeam(
            $membershipRequest->team_id,
            'membro',
            "{$user->name} foi aceito como membro da equipe."
        );

        return response()->json([
            'data' => new MembershipRequestResource($membershipRequest->fresh('user', 'team')),
            'message' => 'Solicitação aceita. Usuário ativado na equipe.',
        ]);
    }

    public function reject(MembershipRequest $membershipRequest): JsonResponse
    {
        $membershipRequest->update(['status' => 'recusada']);

        $user = $membershipRequest->user;
        $user->update(['pending' => false]);

        return response()->json([
            'data' => new MembershipRequestResource($membershipRequest->fresh('user', 'team')),
            'message' => 'Solicitação recusada.',
        ]);
    }
}
