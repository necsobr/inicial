<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Notification::query();

        if ($user->team_id) {
            $query->where('team_id', $user->team_id)->orWhereNull('team_id');
        } else {
            $query->whereNull('team_id');
        }

        $notifications = $query->latest()->get();

        return response()->json([
            'data' => NotificationResource::collection($notifications),
            'unread_count' => $notifications->where('read', false)->count(),
        ]);
    }

    public function markRead(Notification $notification): JsonResponse
    {
        $notification->update(['read' => true]);

        return response()->json([
            'data' => new NotificationResource($notification),
            'message' => 'Notificação marcada como lida.',
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Notification::where('read', false);

        if ($user->team_id) {
            $query->where(fn($q) => $q->where('team_id', $user->team_id)->orWhereNull('team_id'));
        } else {
            $query->whereNull('team_id');
        }

        $count = $query->update(['read' => true]);

        return response()->json([
            'message' => "{$count} notificação(ões) marcada(s) como lida(s).",
        ]);
    }

    public function destroy(Notification $notification): JsonResponse
    {
        $notification->delete();

        return response()->json(['message' => 'Notificação removida com sucesso.']);
    }
}
