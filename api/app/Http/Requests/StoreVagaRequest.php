<?php

namespace App\Http\Requests;

use App\Enums\Modalidade;
use App\Enums\TipoContratacao;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVagaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['required', 'string'],
            'salario' => ['required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'modalidade' => ['required', Rule::enum(Modalidade::class)],
            'tipo' => ['required', Rule::enum(TipoContratacao::class)],
        ];
    }
}
