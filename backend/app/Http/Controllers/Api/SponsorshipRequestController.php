<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SponsorshipRequestResource;
use App\Models\SponsorshipRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SponsorshipRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = SponsorshipRequest::with('team');

        if (!$user->isAdmin()) {
            $query->where('team_id', $user->team_id);
        }

        return response()->json([
            'data' => SponsorshipRequestResource::collection($query->latest()->get()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company' => ['required', 'string', 'max:255'],
            'team_id' => ['required', 'exists:teams,id'],
            'week' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'applicant_email' => ['required', 'email'],
            'applicant_name' => ['required', 'string', 'max:255'],
            'requested_at' => ['required', 'date'],
        ]);

        $sponsorship = SponsorshipRequest::create($data);

        return response()->json([
            'data' => new SponsorshipRequestResource($sponsorship->load('team')),
            'message' => 'Solicitação de patrocínio enviada com sucesso.',
        ], 201);
    }

    public function show(SponsorshipRequest $sponsorshipRequest): JsonResponse
    {
        return response()->json([
            'data' => new SponsorshipRequestResource($sponsorshipRequest->load('team')),
        ]);
    }

    public function update(Request $request, SponsorshipRequest $sponsorshipRequest): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:aguardando_aprovacao,aprovada,recusada,concluida'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $sponsorshipRequest->update($data);

        return response()->json([
            'data' => new SponsorshipRequestResource($sponsorshipRequest->fresh('team')),
            'message' => 'Solicitação de patrocínio atualizada com sucesso.',
        ]);
    }

    public function destroy(SponsorshipRequest $sponsorshipRequest): JsonResponse
    {
        $sponsorshipRequest->delete();

        return response()->json(['message' => 'Solicitação de patrocínio removida com sucesso.']);
    }
}
