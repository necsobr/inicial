<?php

namespace App\Http\Requests\QueueEntry;

use Illuminate\Foundation\Http\FormRequest;

class StoreQueueEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'service_order_id' => ['required', 'exists:service_orders,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'service_order_id.required' => 'A Ordem de Serviço é obrigatória.',
            'service_order_id.exists' => 'Ordem de Serviço não encontrada.',
        ];
    }
}
