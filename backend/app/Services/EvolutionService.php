<?php

namespace App\Services;

use App\Models\Integration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EvolutionService
{
    public function sendTextViaIntegration(Integration $integration, string $phone, string $message): void
    {
        if (!$integration->url || !$integration->api_key || !$integration->instance_name) {
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
                'phone' => $number,
                'error' => $e->getMessage(),
            ]);
        }
    }

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

    public function getQrCode(Integration $integration): array
    {
        if (!$integration->url || !$integration->api_key || !$integration->instance_name) {
            return ['success' => false, 'message' => 'URL, API Key e Nome da Instância são obrigatórios.'];
        }

        try {
            $stateResponse = Http::withHeaders(['apikey' => $integration->api_key])
                ->timeout(10)
                ->get("{$integration->url}/instance/connectionState/{$integration->instance_name}");

            if ($stateResponse->successful()) {
                $state = $stateResponse->json('instance.state') ?? $stateResponse->json('state') ?? 'unknown';
                if ($state === 'open') {
                    return ['success' => true, 'connected' => true, 'message' => 'WhatsApp já está conectado.'];
                }
            }

            $response = Http::withHeaders(['apikey' => $integration->api_key])
                ->timeout(15)
                ->get("{$integration->url}/instance/connect/{$integration->instance_name}");

            if ($response->successful()) {
                $data = $response->json();
                $base64 = $data['base64'] ?? null;
                $code   = $data['code'] ?? null;

                if ($base64) {
                    return [
                        'success'     => true,
                        'connected'   => false,
                        'qrcode'      => $base64,
                        'pairingCode' => $code,
                    ];
                }

                return ['success' => false, 'message' => 'Evolution API não retornou QR code. Verifique se a instância existe.'];
            }

            if (in_array($response->status(), [401, 404])) {
                $create = Http::withHeaders(['apikey' => $integration->api_key])
                    ->timeout(15)
                    ->post("{$integration->url}/instance/create", [
                        'instanceName' => $integration->instance_name,
                        'integration'  => 'WHATSAPP-BAILEYS',
                        'qrcode'       => true,
                    ]);

                if ($create->successful()) {
                    $data   = $create->json();
                    $base64 = $data['qrcode']['base64'] ?? $data['base64'] ?? null;
                    $code   = $data['qrcode']['code'] ?? $data['code'] ?? null;

                    if ($base64) {
                        return [
                            'success'     => true,
                            'connected'   => false,
                            'qrcode'      => $base64,
                            'pairingCode' => $code,
                        ];
                    }

                    return ['success' => false, 'message' => 'Instância criada mas QR code não retornado.'];
                }
            }

            return ['success' => false, 'message' => "Evolution API retornou HTTP {$response->status()}."];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => "Erro: {$e->getMessage()}"];
        }
    }

    public function getPairingCode(Integration $integration, string $phoneNumber): array
    {
        if (!$integration->url || !$integration->api_key || !$integration->instance_name) {
            return ['success' => false, 'message' => 'URL, API Key e Nome da Instância são obrigatórios.'];
        }

        $number = preg_replace('/\D/', '', $phoneNumber);
        if (strlen($number) <= 11) {
            $number = '55' . $number;
        }

        try {
            $stateResponse = Http::withHeaders(['apikey' => $integration->api_key])
                ->timeout(10)
                ->get("{$integration->url}/instance/connectionState/{$integration->instance_name}");

            if ($stateResponse->successful()) {
                $state = $stateResponse->json('instance.state') ?? 'unknown';
                if ($state === 'open') {
                    return ['success' => true, 'connected' => true, 'message' => 'WhatsApp já está conectado.'];
                }
            } else {
                $create = Http::withHeaders(['apikey' => $integration->api_key])
                    ->timeout(15)
                    ->post("{$integration->url}/instance/create", [
                        'instanceName' => $integration->instance_name,
                        'integration'  => 'WHATSAPP-BAILEYS',
                        'qrcode'       => false,
                    ]);

                if (!$create->successful()) {
                    return ['success' => false, 'message' => 'Não foi possível criar a instância.'];
                }
            }

            // O pairing code é obtido no mesmo endpoint de connect, passando o número como query param
            $response = Http::withHeaders(['apikey' => $integration->api_key])
                ->timeout(15)
                ->get("{$integration->url}/instance/connect/{$integration->instance_name}", [
                    'number' => $number,
                ]);

            if ($response->successful()) {
                $data        = $response->json();
                $pairingCode = $data['pairingCode'] ?? null;
                if ($pairingCode) {
                    return ['success' => true, 'connected' => false, 'pairingCode' => $pairingCode];
                }
                return ['success' => false, 'message' => 'Código de pareamento não retornado. Tente novamente em alguns segundos.'];
            }

            return ['success' => false, 'message' => "Erro ao gerar código: HTTP {$response->status()}."];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => "Erro: {$e->getMessage()}"];
        }
    }

    public function connectionState(Integration $integration): array
    {
        if (!$integration->url || !$integration->api_key || !$integration->instance_name) {
            return ['success' => false, 'connected' => false];
        }

        try {
            $response = Http::withHeaders(['apikey' => $integration->api_key])
                ->timeout(10)
                ->get("{$integration->url}/instance/connectionState/{$integration->instance_name}");

            if ($response->successful()) {
                $state     = $response->json('instance.state') ?? $response->json('state') ?? 'unknown';
                $connected = $state === 'open';
                return ['success' => true, 'connected' => $connected, 'state' => $state];
            }

            return ['success' => false, 'connected' => false, 'state' => 'unknown'];
        } catch (\Throwable $e) {
            return ['success' => false, 'connected' => false];
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
