<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReferenceMap\StoreReferenceMapRequest;
use App\Http\Resources\ReferenceMapResource;
use App\Jobs\NotificarMapaRecebido;
use App\Jobs\PrintReferenceMap;
use App\Models\Event;
use App\Models\ReferenceMap;
use App\Services\EpsonService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReferenceMapController extends Controller
{
    public function __construct(private EpsonService $epsonService) {}
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ReferenceMap::with('team', 'serviceOrder', 'event', 'uploader');

        if (!$user->isAdmin() && !$user->isProducao()) {
            $query->where('team_id', $user->team_id);
        }

        return response()->json([
            'data' => ReferenceMapResource::collection($query->latest()->get()),
        ]);
    }

    public function store(StoreReferenceMapRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['uploaded_by'] = $request->user()->id;
        $data['upload_date'] = now()->toDateString();

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('reference-maps', 'public');
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_path'] = $path;
        }

        // Valida que delivery_date está entre 3 e 1 dias antes do evento
        $event = Event::findOrFail($data['event_id']);
        $eventDate = Carbon::parse($event->date);
        $deliveryDate = Carbon::parse($data['delivery_date']);

        $diffDays = $deliveryDate->diffInDays($eventDate, false);

        if ($diffDays < 1 || $diffDays > 3) {
            return response()->json([
                'message' => 'Dados inválidos.',
                'errors' => [
                    'delivery_date' => ['A data de entrega deve ser entre 3 e 1 dias antes do evento.'],
                ],
            ], 422);
        }

        $map = ReferenceMap::create($data);

        NotificarMapaRecebido::dispatchComHorario($map);

        return response()->json([
            'data' => new ReferenceMapResource($map->load('team', 'serviceOrder', 'event', 'uploader')),
            'message' => 'Mapa de referência criado com sucesso.',
        ], 201);
    }

    public function show(ReferenceMap $referenceMap): JsonResponse
    {
        return response()->json([
            'data' => new ReferenceMapResource($referenceMap->load('team', 'serviceOrder', 'event', 'uploader')),
        ]);
    }

    public function update(Request $request, ReferenceMap $referenceMap): JsonResponse
    {
        $data = $request->validate([
            'file_name'        => ['sometimes', 'string'],
            'delivery_date'    => ['sometimes', 'date'],
            'delivery_time'    => ['sometimes', 'date_format:H:i'],
            'delivery_address' => ['nullable', 'string'],
            'status'           => ['sometimes', 'string', 'in:recebido,em_producao,pronto,entregue'],
        ]);

        $previousStatus = $referenceMap->status;
        $referenceMap->update($data);

        if (($data['status'] ?? null) === 'em_producao' && $previousStatus !== 'em_producao') {
            if ($referenceMap->file_path) {
                $so        = $referenceMap->serviceOrder;
                $paperType = $so->paper_type ?? 'A4';
                $copies    = (int) max(1, floor(($so->copies ?? 1) / max(1, $so->meetings_count ?? 1)));
                $jobName   = 'Mapa - ' . ($referenceMap->team->name ?? 'Equipe') . " ({$paperType})";
                PrintReferenceMap::dispatch($referenceMap, $paperType, $copies, $jobName);
            }
        }

        return response()->json([
            'data' => new ReferenceMapResource($referenceMap->fresh('team', 'serviceOrder', 'event', 'uploader')),
            'message' => 'Mapa de referência atualizado com sucesso.',
        ]);
    }

    public function destroy(ReferenceMap $referenceMap): JsonResponse
    {
        $referenceMap->delete();

        return response()->json(['message' => 'Mapa de referência removido com sucesso.']);
    }

    public function print(Request $request, ReferenceMap $referenceMap): JsonResponse
    {
        $data = $request->validate([
            'printer_chave' => ['nullable', 'string'],
            'copies'        => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        if (!$referenceMap->file_path) {
            return response()->json(['success' => false, 'message' => 'Mapa sem arquivo para imprimir.'], 422);
        }

        $so        = $referenceMap->serviceOrder;
        $paperType = $so->paper_type ?? 'A4';
        $copies    = $data['copies'] ?? (int) max(1, floor(($so->copies ?? 1) / max(1, $so->meetings_count ?? 1)));
        $jobName   = 'Mapa - ' . ($referenceMap->team->name ?? 'Equipe') . " ({$paperType})";

        if (!empty($data['printer_chave'])) {
            $impressoras = $this->epsonService->getPrinters();
            $printer     = collect($impressoras)->firstWhere('chave', $data['printer_chave']);
            if (!$printer) {
                return response()->json(['success' => false, 'message' => 'Impressora não encontrada.'], 422);
            }
            PrintReferenceMap::dispatch($referenceMap, $paperType, $copies, $jobName)
                ->onQueue('impressao');
        } else {
            PrintReferenceMap::dispatch($referenceMap, $paperType, $copies, $jobName);
        }

        return response()->json([
            'success' => true,
            'message' => 'Trabalho adicionado à fila de impressão.',
        ]);
    }
}
