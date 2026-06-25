<?php

namespace App\Services;

use App\Models\Integration;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class EpsonService
{
    private const CUPS_SOCKET = '/run/cups/cups.sock';

    private function getIntegration(): ?Integration
    {
        return Integration::where('type', 'impressao')->where('active', true)->first();
    }

    public function getPrinters(): array
    {
        $integration = $this->getIntegration();
        if (!$integration) return [];

        return ($integration->config ?? [])['impressoras'] ?? [];
    }

    public function print(string $filePath, string $printerIp, int $copies = 1, string $jobName = 'Mapa de Referência'): bool
    {
        $printerName = $this->findCupsNameByIp($printerIp);
        if (!$printerName) {
            Log::error("EpsonService: nenhuma impressora CUPS encontrada para IP {$printerIp}");
            return false;
        }

        return $this->printViaCups($filePath, $printerName, $copies, $jobName);
    }

    public function printOnDefault(string $filePath, int $copies = 1, string $jobName = 'Mapa de Referência'): bool
    {
        $integration = $this->getIntegration();
        if (!$integration) {
            Log::warning('EpsonService: integração de impressão não configurada.');
            return false;
        }

        $config = $integration->config ?? [];
        $impressoras = $config['impressoras'] ?? [];

        if (empty($impressoras)) {
            Log::warning('EpsonService: nenhuma impressora configurada.');
            return false;
        }

        $defaultKey = $config['padrao'] ?? null;
        $printer = null;

        if ($defaultKey) {
            foreach ($impressoras as $p) {
                if ($p['chave'] === $defaultKey) { $printer = $p; break; }
            }
        }

        $printer = $printer ?? $impressoras[0];

        return $this->print($filePath, $printer['ip'], $copies, $jobName);
    }

    public function printForPaperType(string $filePath, string $paperType, int $copies = 1, string $jobName = 'Mapa de Referência'): bool
    {
        $integration = $this->getIntegration();
        if (!$integration) {
            Log::warning('EpsonService: integração de impressão não configurada.');
            return false;
        }

        $config     = $integration->config ?? [];
        $mapeamento = $config['mapeamento_papel'] ?? [];
        $impressoras = $config['impressoras'] ?? [];

        $chave = $mapeamento[$paperType] ?? ($config['padrao'] ?? null);

        if (!$chave) {
            return $this->printOnDefault($filePath, $copies, $jobName);
        }

        foreach ($impressoras as $p) {
            if ($p['chave'] === $chave) {
                return $this->print($filePath, $p['ip'], $copies, $jobName);
            }
        }

        Log::warning("EpsonService: impressora '{$chave}' para papel {$paperType} não encontrada. Usando padrão.");
        return $this->printOnDefault($filePath, $copies, $jobName);
    }

    public function printOnAll(string $filePath, int $copies = 1, string $jobName = 'Mapa de Referência'): array
    {
        $results = [];
        foreach ($this->getPrinters() as $printer) {
            $results[$printer['nome']] = $this->print($filePath, $printer['ip'], $copies, $jobName);
        }
        return $results;
    }

    // ── Internals ──────────────────────────────────────────────────────────

    private function findCupsNameByIp(string $ip): ?string
    {
        // Primary: look in integration config for cups_nome
        foreach ($this->getPrinters() as $p) {
            if ($p['ip'] === $ip) {
                return $p['cups_nome'] ?? null;
            }
        }
        return null;
    }

    private function printViaCups(string $filePath, string $printerName, int $copies, string $jobName): bool
    {
        $absolutePath = Storage::disk('public')->path($filePath);

        if (!file_exists($absolutePath)) {
            Log::error("EpsonService: arquivo não encontrado: {$absolutePath}");
            return false;
        }

        $safePrinter = escapeshellarg($printerName);
        $safeName    = escapeshellarg($jobName);
        $safePath    = escapeshellarg($absolutePath);
        $safeCopies  = (int) $copies;

        $cmd = "CUPS_SERVER=" . self::CUPS_SOCKET . " lp -d {$safePrinter} -t {$safeName} -n {$safeCopies} {$safePath} 2>&1";

        $output = $this->runCmd($cmd);

        if (str_contains($output, 'request id')) {
            Log::info("EpsonService: impressão enviada para '{$printerName}': {$output}");
            return true;
        }

        Log::error("EpsonService: falha ao imprimir em '{$printerName}': {$output}");
        return false;
    }

    private function runCmd(string $cmd): string
    {
        $output = [];
        exec($cmd, $output);
        return implode("\n", $output);
    }
}
