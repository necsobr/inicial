<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MembershipRequestResource;
use App\Models\MembershipRequest;
use App\Models\User;
use App\Services\EvolutionService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipRequestController extends Controller
{
    public function __construct(
        private NotificationService $notificationService,
        private EvolutionService $evolutionService,
    ) {}

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

    public function store(Request $request): JsonResponse
    {
        $request->validate(['team_id' => ['required', 'exists:teams,id']]);

        $user = $request->user();

        MembershipRequest::where('user_id', $user->id)
            ->where('status', 'pendente')
            ->update(['status' => 'recusada']);

        $mr = MembershipRequest::create([
            'user_id'      => $user->id,
            'team_id'      => $request->team_id,
            'phone'        => $user->phone,
            'status'       => 'pendente',
            'requested_at' => now()->toDateString(),
        ]);

        $user->update(['pending' => true]);

        // Notifica coordenador e trio via WhatsApp
        User::where('team_id', $request->team_id)
            ->whereIn('role', ['coordenador', 'trio'])
            ->whereNotNull('phone')
            ->get()
            ->each(fn(User $leader) => $this->evolutionService->sendAutoMessage('solicitacaoEntrada', $leader->phone, [
                'nome'     => $user->name,
                'telefone' => $user->phone ?? 'não informado',
            ]));

        return response()->json([
            'data'    => new MembershipRequestResource($mr->load('user', 'team')),
            'message' => 'Solicitação enviada.',
        ], 201);
    }

    public function accept(MembershipRequest $membershipRequest): JsonResponse
    {
        $membershipRequest->update(['status' => 'aceita']);

        $user = $membershipRequest->user;
        $user->update([
            'team_id' => $membershipRequest->team_id,
            'active'  => true,
            'pending' => false,
        ]);

        $this->notificationService->createForTeam(
            $membershipRequest->team_id,
            'membro',
            "{$user->name} foi aceito como membro da equipe.",
            true
        );

        // Avisa o usuário que foi aceito
        if ($user->phone) {
            $team = $membershipRequest->team;
            $this->evolutionService->sendAutoMessage('entradaGrupo', $user->phone, [
                'nome'   => $user->name,
                'equipe' => $team?->name ?? '',
            ]);
        }

        return response()->json([
            'data'    => new MembershipRequestResource($membershipRequest->fresh('user', 'team')),
            'message' => 'Solicitação aceita. Usuário ativado na equipe.',
        ]);
    }

    public function reject(MembershipRequest $membershipRequest): JsonResponse
    {
        $membershipRequest->update(['status' => 'recusada']);

        $user = $membershipRequest->user;
        $user->update(['pending' => false]);

        return response()->json([
            'data'    => new MembershipRequestResource($membershipRequest->fresh('user', 'team')),
            'message' => 'Solicitação recusada.',
        ]);
    }
}
