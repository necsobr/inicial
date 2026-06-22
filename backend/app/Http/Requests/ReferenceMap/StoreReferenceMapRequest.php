<?php

namespace App\Http\Requests\ReferenceMap;

use Illuminate\Foundation\Http\FormRequest;

class StoreReferenceMapRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || $user->isProducao() || $user->isCoordenador() || $user->isTrio());
    }

    public function rules(): array
    {
        return [
            'team_id' => ['required', 'exists:teams,id'],
            'service_order_id' => ['required', 'exists:service_orders,id'],
            'event_id' => ['required', 'exists:events,id'],
            'file' => ['nullable', 'file', 'mimes:pdf', 'max:20480'],
            'file_name' => ['nullable', 'string', 'max:255', 'required_without:file'],
            'delivery_date' => ['required', 'date'],
            'delivery_time' => ['required', 'date_format:H:i'],
            'delivery_address' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'team_id.required' => 'A equipe é obrigatória.',
            'service_order_id.required' => 'A Ordem de Serviço é obrigatória.',
            'event_id.required' => 'O evento é obrigatório.',
            'file_name.required' => 'O nome do arquivo é obrigatório.',
            'delivery_date.required' => 'A data de entrega é obrigatória.',
            'delivery_time.required' => 'O horário de entrega é obrigatório.',
            'delivery_time.date_format' => 'O horário deve estar no formato HH:MM.',
        ];
    }
}
