<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PrintRequestResource;
use App\Models\PrintRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrintRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = PrintRequest::with('team');

        if ($user->isProducao() || $user->isAdmin()) {
            // Produção e admin vêem todas
        } else {
            $query->where('team_id', $user->team_id);
        }

        return response()->json([
            'data' => PrintRequestResource::collection($query->latest()->get()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'team_id' => ['required', 'exists:teams,id'],
            'requester_email' => ['required', 'email'],
            'requester_name' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1'],
            'event_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $printRequest = PrintRequest::create($data);

        return response()->json([
            'data' => new PrintRequestResource($printRequest->load('team')),
            'message' => 'Requisição de impressão criada com sucesso.',
        ], 201);
    }

    public function show(PrintRequest $printRequest): JsonResponse
    {
        return response()->json([
            'data' => new PrintRequestResource($printRequest->load('team')),
        ]);
    }

    public function update(Request $request, PrintRequest $printRequest): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:recebido,em_producao,pronto,entregue'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $printRequest->update($data);

        return response()->json([
            'data' => new PrintRequestResource($printRequest->fresh('team')),
            'message' => 'Requisição de impressão atualizada com sucesso.',
        ]);
    }

    public function destroy(PrintRequest $printRequest): JsonResponse
    {
        $printRequest->delete();

        return response()->json(['message' => 'Requisição de impressão removida com sucesso.']);
    }
}
