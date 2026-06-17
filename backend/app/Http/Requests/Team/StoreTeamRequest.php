<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'regional' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'total_members' => ['nullable', 'integer', 'min:0'],
            'internal_refs' => ['nullable', 'integer', 'min:0'],
            'external_refs' => ['nullable', 'integer', 'min:0'],
            'meetings_1a1' => ['nullable', 'integer', 'min:0'],
            'guests' => ['nullable', 'integer', 'min:0'],
            'education' => ['nullable', 'integer', 'min:0'],
            'total_business' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome da equipe é obrigatório.',
        ];
    }
}
