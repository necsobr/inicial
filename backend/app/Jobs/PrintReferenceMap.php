<?php

namespace App\Jobs;

use App\Models\ReferenceMap;
use App\Services\EpsonService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PrintReferenceMap implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 120;

    public function __construct(
        private ReferenceMap $referenceMap,
        private string $paperType,
        private int $copies,
        private string $jobName,
    ) {
        $this->onQueue('impressao');
    }

    public function handle(EpsonService $epsonService): void
    {
        $filePath = $this->referenceMap->file_path;

        if (!$filePath) {
            Log::warning("PrintReferenceMap: mapa #{$this->referenceMap->id} sem arquivo.");
            return;
        }

        $ok = $epsonService->printForPaperType($filePath, $this->paperType, $this->copies, $this->jobName);

        if (!$ok) {
            throw new \RuntimeException("Falha ao imprimir mapa #{$this->referenceMap->id} ({$this->paperType}).");
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error("PrintReferenceMap: todas as tentativas falharam para mapa #{$this->referenceMap->id}: " . $e->getMessage());

        $this->referenceMap->update(['status' => 'recebido']);
    }
}
