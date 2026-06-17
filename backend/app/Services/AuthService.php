<?php

namespace App\Services;

use App\Models\GroupCreationRequest;
use App\Models\MembershipRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(private NotificationService $notificationService) {}

    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        if (!$user->active) {
            throw ValidationException::withMessages([
                'email' => ['Conta inativa. Aguarde aprovação do coordenador.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return ['user' => $user->load('team'), 'token' => $token];
    }

    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'membro',
            'phone' => $data['phone'] ?? null,
            'company' => $data['company'] ?? null,
            'active' => false,
            'pending' => true,
        ]);

        if (!empty($data['team_id'])) {
            MembershipRequest::create([
                'user_id' => $user->id,
                'team_id' => $data['team_id'],
                'phone' => $data['phone'] ?? null,
                'status' => 'pendente',
                'requested_at' => now()->toDateString(),
            ]);
        }

        return $user;
    }

    public function registerGroup(array $data): User
    {
        $gcr = GroupCreationRequest::create([
            'requester_name' => $data['name'],
            'requester_email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'company' => $data['company'] ?? null,
            'group_name' => $data['group_name'],
            'regional' => $data['regional'] ?? null,
            'city' => $data['city'] ?? null,
            'requested_at' => now()->toDateString(),
            'status' => 'pendente',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'coordenador',
            'phone' => $data['phone'] ?? null,
            'company' => $data['company'] ?? null,
            'active' => false,
            'pending' => true,
            'group_creation_request_id' => $gcr->id,
        ]);

        $gcr->update(['user_id' => $user->id]);

        return $user;
    }

    public function changeRole(User $target, string $newRole, User $actor): User
    {
        $oldRole = $target->role;
        $target->update(['role' => $newRole]);

        if ($target->team_id) {
            $this->notificationService->createForTeam(
                $target->team_id,
                'cargo',
                "O papel de {$target->name} foi alterado de {$oldRole} para {$newRole} por {$actor->name}."
            );
        }

        return $target->fresh();
    }
}
