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
Route::get('/teams', [TeamController::class, 'index']);
Route::post('/asaas/webhook', [SponsorshipRequestController::class, 'webhook']);

// Rotas autenticadas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Equipes
    Route::apiResource('teams', TeamController::class)->except(['index']);
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
    Route::post('/reference-maps/{referenceMap}/print', [ReferenceMapController::class, 'print']);

    // Filas de OS
    Route::get('/queue-entries', [QueueEntryController::class, 'index']);
    Route::post('/queue-entries', [QueueEntryController::class, 'store']);
    Route::post('/queue-entries/{queueEntry}/pay', [QueueEntryController::class, 'pay']);
    Route::post('/queue-entries/{queueEntry}/decline', [QueueEntryController::class, 'decline']);
    Route::get('/queue-entries/{queueEntry}/payment-status', [QueueEntryController::class, 'checkPaymentStatus']);

    // Solicitações de adesão (entrar em equipe existente)
    Route::get('/membership-requests', [MembershipRequestController::class, 'index']);
    Route::post('/membership-requests', [MembershipRequestController::class, 'store']);
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
        Route::post('/integrations/{integration}/send-message', [IntegrationController::class, 'sendMessage']);
        Route::get('/integrations/{integration}/qrcode', [IntegrationController::class, 'qrCode']);
        Route::post('/integrations/{integration}/pairing-code', [IntegrationController::class, 'pairingCode']);
        Route::get('/integrations/{integration}/connection-state', [IntegrationController::class, 'connectionState']);
    });

    // Solicitações de patrocínio
    Route::apiResource('sponsorship-requests', SponsorshipRequestController::class);
    Route::get('/sponsorship-requests/{sponsorshipRequest}/payment-status', [SponsorshipRequestController::class, 'checkPaymentStatus']);

    // Requisições de impressão
    Route::apiResource('print-requests', PrintRequestController::class);

    // Usuários
    Route::get('/users', [AuthController::class, 'index']);
    Route::put('/users/{user}', [AuthController::class, 'update']);
    Route::delete('/users/{user}', [AuthController::class, 'destroy']);
    Route::put('/users/{user}/role', [AuthController::class, 'changeRole']);
    Route::post('/users/{user}/impersonate', [AuthController::class, 'impersonate']);
});
