<?php

namespace App\Services;

use App\Models\Integration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EvolutionService
{
    private function whatsappIntegration(): ?Integration
    {
        return Integration::where('type', 'whatsapp')->where('active', true)->first();
    }

    public function sendText(string $phone, string $message): void
    {
        $integration = $this->whatsappIntegration();

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
                'phone' => $number,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function startConnection(Integration $integration): array
    {
        if (!$integration->url || !$integration->api_key || !$integration->instance_name) {
            return ['success' => false, 'message' => 'Integração não configurada.'];
        }

        $headers  = ['apikey' => $integration->api_key];
        $base     = rtrim($integration->url, '/');
        $instance = $integration->instance_name;

        // Tenta criar; se já existir, apenas inicia a conexão
        $create = Http::withHeaders($headers)->timeout(10)->post("{$base}/instance/create", [
            'instanceName' => $instance,
            'qrcode'       => true,
            'integration'  => 'WHATSAPP-BAILEYS',
        ]);

        // Se já existia, força a reconexão
        if (!$create->successful()) {
            Http::withHeaders($headers)->timeout(10)->get("{$base}/instance/connect/{$instance}");
        }

        return ['success' => true];
    }

    public function fetchQrCode(Integration $integration): array
    {
        if (!$integration->url || !$integration->api_key || !$integration->instance_name) {
            return ['qr' => null];
        }

        $response = Http::withHeaders(['apikey' => $integration->api_key])
            ->timeout(10)
            ->get(rtrim($integration->url, '/') . "/instance/connect/{$integration->instance_name}");

        if ($response->successful()) {
            $qr = $response->json('base64') ?? $response->json('qrcode.base64');
            if ($qr) {
                return ['qr' => $qr];
            }
        }

        return ['qr' => null];
    }

    public function getConnectionState(Integration $integration): array
    {
        if (!$integration->url || !$integration->api_key || !$integration->instance_name) {
            return ['connected' => false, 'state' => 'not_configured'];
        }

        try {
            $response = Http::withHeaders(['apikey' => $integration->api_key])
                ->timeout(5)
                ->get("{$integration->url}/instance/connectionState/{$integration->instance_name}");

            if ($response->successful()) {
                $state = $response->json('instance.state') ?? $response->json('state') ?? 'unknown';
                return ['connected' => $state === 'open', 'state' => $state];
            }
        } catch (\Throwable) {}

        return ['connected' => false, 'state' => 'error'];
    }

    public function testConnection(Integration $integration): array
    {
        $result = $this->getConnectionState($integration);

        if ($result['state'] === 'not_configured') {
            return ['success' => false, 'message' => 'URL, API Key e Nome da Instância são obrigatórios.'];
        }

        return [
            'success' => $result['connected'],
            'message' => $result['connected']
                ? "Instância '{$integration->instance_name}' conectada."
                : "Instância '{$integration->instance_name}' não está conectada (estado: {$result['state']}).",
        ];
    }
}
