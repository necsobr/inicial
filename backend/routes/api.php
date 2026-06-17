<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ServiceOrderController;
use App\Http\Controllers\Api\ReferenceMapController;
use App\Http\Controllers\Api\QueueEntryController;
use App\Http\Controllers\Api\MembershipRequestController;
use App\Http\Controllers\Api\GroupCreationRequestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\SponsorshipRequestController;
use App\Http\Controllers\Api\PrintRequestController;
use Illuminate\Support\Facades\Route;

// Rotas públicas
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/register-group', [AuthController::class, 'registerGroup']);

// Rotas autenticadas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Equipes
    Route::apiResource('teams', TeamController::class);
    Route::get('/my-team', [TeamController::class, 'myTeam']);

    // Membros (cartão BNI)
    Route::apiResource('members', MemberController::class);
    Route::get('/teams/{team}/members', [MemberController::class, 'byTeam']);

    // Eventos
    Route::apiResource('events', EventController::class);
    Route::get('/teams/{team}/events', [EventController::class, 'byTeam']);

    // Speakers
    Route::apiResource('speakers', \App\Http\Controllers\Api\SpeakerController::class);

    // Ordens de Serviço
    Route::apiResource('service-orders', ServiceOrderController::class);

    // Mapas de Referência
    Route::apiResource('reference-maps', ReferenceMapController::class);

    // Filas de OS
    Route::get('/queue-entries', [QueueEntryController::class, 'index']);
    Route::post('/queue-entries', [QueueEntryController::class, 'store']);
    Route::post('/queue-entries/{queueEntry}/pay', [QueueEntryController::class, 'pay']);
    Route::post('/queue-entries/{queueEntry}/decline', [QueueEntryController::class, 'decline']);

    // Solicitações de adesão (entrar em equipe existente)
    Route::get('/membership-requests', [MembershipRequestController::class, 'index']);
    Route::post('/membership-requests/{membershipRequest}/accept', [MembershipRequestController::class, 'accept']);
    Route::post('/membership-requests/{membershipRequest}/reject', [MembershipRequestController::class, 'reject']);

    // Solicitações de criação de grupo
    Route::get('/group-creation-requests', [GroupCreationRequestController::class, 'index']);
    Route::post('/group-creation-requests/{groupCreationRequest}/approve', [GroupCreationRequestController::class, 'approve']);
    Route::post('/group-creation-requests/{groupCreationRequest}/reject', [GroupCreationRequestController::class, 'reject']);

    // Notificações
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // Integrações (apenas admin)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('integrations', IntegrationController::class);
        Route::post('/integrations/{integration}/test', [IntegrationController::class, 'test']);
    });

    // Solicitações de patrocínio
    Route::apiResource('sponsorship-requests', SponsorshipRequestController::class);

    // Requisições de impressão
    Route::apiResource('print-requests', PrintRequestController::class);

    // Alterar papel de usuário (coordenador/admin)
    Route::put('/users/{user}/role', [AuthController::class, 'changeRole']);
});
