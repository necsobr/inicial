<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\IntegrationResource;
use App\Models\Integration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => IntegrationResource::collection(Integration::all()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'url' => ['nullable', 'url'],
            'api_key' => ['nullable', 'string'],
            'active' => ['boolean'],
            'type' => ['required', 'in:impressao,whatsapp,pagamento'],
        ]);

        $integration = Integration::create($data);

        return response()->json([
            'data' => new IntegrationResource($integration),
            'message' => 'Integração criada com sucesso.',
        ], 201);
    }

    public function show(Integration $integration): JsonResponse
    {
        return response()->json([
            'data' => new IntegrationResource($integration),
        ]);
    }

    public function update(Request $request, Integration $integration): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'url' => ['nullable', 'url'],
            'api_key' => ['nullable', 'string'],
            'active' => ['boolean'],
            'type' => ['sometimes', 'in:impressao,whatsapp,pagamento'],
        ]);

        $integration->update($data);

        return response()->json([
            'data' => new IntegrationResource($integration->fresh()),
            'message' => 'Integração atualizada com sucesso.',
        ]);
    }

    public function destroy(Integration $integration): JsonResponse
    {
        $integration->delete();

        return response()->json(['message' => 'Integração removida com sucesso.']);
    }

    public function test(Integration $integration): JsonResponse
    {
        if (!$integration->url) {
            return response()->json([
                'success' => false,
                'message' => 'Integração sem URL configurada.',
            ], 422);
        }

        // Simula ping
        return response()->json([
            'success' => true,
            'message' => "Conexão com '{$integration->name}' simulada com sucesso.",
            'latency_ms' => rand(20, 200),
        ]);
    }
}
