<?php

namespace App\Services;

use App\Models\Integration;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class AsaasService
{
    private function client(): PendingRequest
    {
        $integration = Integration::where('type', 'pagamento')->where('active', true)->first();
        $baseUrl = rtrim($integration?->url ?? 'https://sandbox.asaas.com/api/v3', '/');
        $apiKey  = $integration?->api_key ?? '';

        return Http::withHeaders([
            'access_token'  => $apiKey,
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json',
        ])->baseUrl($baseUrl)->timeout(20);
    }

    public function isConfigured(): bool
    {
        $integration = Integration::where('type', 'pagamento')->where('active', true)->first();
        return $integration && $integration->url && $integration->api_key;
    }

    public function createOrFindCustomer(array $data): array
    {
        $cpfCnpj = preg_replace('/\D/', '', $data['cpfCnpj'] ?? '');

        $search = $this->client()->get('/customers', ['cpfCnpj' => $cpfCnpj]);
        if ($search->successful()) {
            $results = $search->json('data') ?? [];
            if (!empty($results)) {
                return $results[0];
            }
        }

        $payload = array_filter([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'cpfCnpj'     => $cpfCnpj,
            'mobilePhone' => $data['mobilePhone'] ?? null,
        ]);

        $response = $this->client()->post('/customers', $payload);

        if (!$response->successful()) {
            throw new \RuntimeException('Erro ao criar cliente no Asaas: ' . $response->body());
        }

        return $response->json();
    }

    public function createCharge(string $customerId, array $data): array
    {
        $response = $this->client()->post('/payments', [
            'customer'    => $customerId,
            'billingType' => $data['billingType'],
            'value'       => $data['value'],
            'dueDate'     => $data['dueDate'],
            'description' => $data['description'],
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Erro ao criar cobrança no Asaas: ' . $response->body());
        }

        return $response->json();
    }

    public function getPixQrCode(string $paymentId): array
    {
        $response = $this->client()->get("/payments/{$paymentId}/pixQrCode");
        if (!$response->successful()) {
            return ['encodedImage' => null, 'payload' => null];
        }
        return $response->json();
    }

    public function getPaymentStatus(string $paymentId): string
    {
        $response = $this->client()->get("/payments/{$paymentId}");
        if (!$response->successful()) {
            return 'PENDING';
        }
        return $response->json('status') ?? 'PENDING';
    }
}
