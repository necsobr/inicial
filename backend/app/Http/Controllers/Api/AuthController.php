<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterGroupRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->email,
            $request->password
        );

        return response()->json([
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
            ],
            'message' => 'Login realizado com sucesso.',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()->load('team')),
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Cadastro realizado. Aguarde a aprovação do coordenador.',
        ], 201);
    }

    public function registerGroup(RegisterGroupRequest $request): JsonResponse
    {
        $user = $this->authService->registerGroup($request->validated());

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Solicitação de criação de grupo enviada. Aguarde aprovação do administrador.',
        ], 201);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'data' => new UserResource($user->fresh('team')),
            'message' => 'Perfil atualizado com sucesso.',
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json(['data' => UserResource::collection(User::with('team')->get())]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();
        if (!$actor->isAdmin()) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $request->validate([
            'role'    => ['sometimes', 'in:admin,coordenador,trio,membro,producao'],
            'team_id' => ['sometimes', 'nullable', 'exists:teams,id'],
            'active'  => ['sometimes', 'boolean'],
        ]);

        $user->update($request->only(['role', 'team_id', 'active']));

        return response()->json([
            'data' => new UserResource($user->fresh('team')),
            'message' => 'Usuário atualizado com sucesso.',
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Não é possível excluir sua própria conta.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Usuário removido com sucesso.']);
    }

    public function impersonate(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $token = $user->createToken('impersonation')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => new UserResource($user->load('team')),
                'token' => $token,
            ],
            'message' => 'Sessão iniciada como ' . $user->name . '.',
        ]);
    }

    public function changeRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role' => ['required', 'in:admin,coordenador,trio,membro,producao'],
        ]);

        $actor = $request->user();

        if (!$actor->isAdmin() && !$actor->isCoordenador()) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $updated = $this->authService->changeRole($user, $request->role, $actor);

        return response()->json([
            'data' => new UserResource($updated),
            'message' => 'Papel do usuário alterado com sucesso.',
        ]);
    }
}
