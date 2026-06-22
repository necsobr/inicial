<?php

namespace App\Http\Requests\ServiceOrder;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || $user->isCoordenador() || $user->isTrio());
    }

    public function rules(): array
    {
        return [
            'team_id' => ['required', 'exists:teams,id'],
            'name' => ['nullable', 'string', 'max:100'],
            'paper_type' => ['required', 'in:A4,A3'],
            'copies' => ['nullable', 'integer', 'min:1'],
            'recurrence' => ['required', 'in:semanal,unica'],
            'day_of_week' => ['nullable', 'in:domingo,segunda,terca,quarta,quinta,sexta,sabado',
                'required_if:recurrence,semanal'],
            'single_date' => ['nullable', 'date', 'required_if:recurrence,unica'],
            'meetings_count' => ['required', 'integer', 'min:1'],
            'sponsor_slots' => ['required', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'team_id.required' => 'A equipe é obrigatória.',
            'paper_type.required' => 'O tipo de papel é obrigatório.',
            'recurrence.required' => 'A recorrência é obrigatória.',
            'day_of_week.required_if' => 'O dia da semana é obrigatório para recorrência semanal.',
            'single_date.required_if' => 'A data única é obrigatória para recorrência única.',
            'meetings_count.required' => 'O número de reuniões é obrigatório.',
            'sponsor_slots.required' => 'O número de vagas de patrocínio é obrigatório.',
            'start_date.required' => 'A data de início é obrigatória.',
        ];
    }
}
