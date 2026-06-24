<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MessageTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => MessageTemplate::all()]);
    }

    public function update(Request $request, MessageTemplate $messageTemplate): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $request->validate(['body' => ['required', 'string', 'max:2000']]);

        $messageTemplate->update(['body' => $request->body]);

        return response()->json([
            'data'    => $messageTemplate,
            'message' => 'Template atualizado com sucesso.',
        ]);
    }
}
