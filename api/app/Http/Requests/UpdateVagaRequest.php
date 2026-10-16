<?php

namespace App\Http\Requests;

use App\Enums\Modalidade;
use App\Enums\TipoContratacao;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVagaRequest extends FormRequest
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
     * "sometimes" permite atualização parcial (PATCH): só valida o campo se ele for enviado.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['sometimes', 'required', 'string', 'max:255'],
            'descricao' => ['sometimes', 'required', 'string'],
            'salario' => ['sometimes', 'required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'modalidade' => ['sometimes', 'required', Rule::enum(Modalidade::class)],
            'tipo' => ['sometimes', 'required', Rule::enum(TipoContratacao::class)],
        ];
    }
}
