<?php

namespace App\Services;

use App\Models\Integration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EvolutionService
{
    public function sendText(string $phone, string $message): void
    {
        $integration = Integration::where('type', 'whatsapp')
            ->where('active', true)
            ->first();

        if (!$integration?->url || !$integration?->api_key || !$integration?->instance_name) {
            return;
        }

        $number = preg_replace('/\D/', '', $phone);

        if (strlen($number) <= 11) {
            $number = '55' . $number;
        }

        try {
            Http::withHeaders(['apikey' => $integration->api_key])
                ->timeout(10)
                ->post("{$integration->url}/message/sendText/{$integration->instance_name}", [
                    'number' => $number,
                    'text'   => $message,
                ]);
        } catch (\Throwable $e) {
            Log::warning('EvolutionService: falha ao enviar WhatsApp', [
                'phone'   => $number,
                'error'   => $e->getMessage(),
            ]);
        }
    }

    public function testConnection(Integration $integration): array
    {
        if (!$integration->url || !$integration->api_key || !$integration->instance_name) {
            return ['success' => false, 'message' => 'URL, API Key e Nome da Instância são obrigatórios.'];
        }

        try {
            $start = microtime(true);
            $response = Http::withHeaders(['apikey' => $integration->api_key])
                ->timeout(10)
                ->get("{$integration->url}/instance/connectionState/{$integration->instance_name}");
            $latency = (int) ((microtime(true) - $start) * 1000);

            if ($response->successful()) {
                $state = $response->json('instance.state') ?? $response->json('state') ?? 'unknown';
                $connected = $state === 'open';
                return [
                    'success'    => $connected,
                    'message'    => $connected
                        ? "Instância '{$integration->instance_name}' conectada."
                        : "Instância '{$integration->instance_name}' não está conectada (estado: {$state}).",
                    'latency_ms' => $latency,
                ];
            }

            return [
                'success' => false,
                'message' => "Evolution API retornou HTTP {$response->status()}.",
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => "Erro de conexão: {$e->getMessage()}"];
        }
    }
}
