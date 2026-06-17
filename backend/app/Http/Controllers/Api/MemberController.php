<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use App\Models\Member;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Member::with('team', 'user');

        if (!$user->isAdmin()) {
            $query->where('team_id', $user->team_id);
        }

        return response()->json([
            'data' => MemberResource::collection($query->get()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'specialty' => ['nullable', 'string', 'max:255'],
            'contact' => ['nullable', 'string', 'max:255'],
            'level' => ['nullable', 'string', 'max:100'],
            'team_id' => ['required', 'exists:teams,id'],
            'user_id' => ['nullable', 'exists:users,id'],
        ]);

        $member = Member::create($data);

        return response()->json([
            'data' => new MemberResource($member->load('team', 'user')),
            'message' => 'Membro criado com sucesso.',
        ], 201);
    }

    public function show(Member $member): JsonResponse
    {
        return response()->json([
            'data' => new MemberResource($member->load('team', 'user')),
        ]);
    }

    public function update(Request $request, Member $member): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'specialty' => ['nullable', 'string', 'max:255'],
            'contact' => ['nullable', 'string', 'max:255'],
            'level' => ['nullable', 'string', 'max:100'],
            'team_id' => ['sometimes', 'exists:teams,id'],
            'user_id' => ['nullable', 'exists:users,id'],
        ]);

        $member->update($data);

        return response()->json([
            'data' => new MemberResource($member->fresh('team', 'user')),
            'message' => 'Membro atualizado com sucesso.',
        ]);
    }

    public function destroy(Member $member): JsonResponse
    {
        $member->delete();

        return response()->json(['message' => 'Membro removido com sucesso.']);
    }

    public function byTeam(Team $team): JsonResponse
    {
        $members = Member::with('user')->where('team_id', $team->id)->get();

        return response()->json([
            'data' => MemberResource::collection($members),
        ]);
    }
}
