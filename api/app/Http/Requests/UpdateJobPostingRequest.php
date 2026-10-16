<?php

namespace App\Http\Requests;

use App\Enums\ContractType;
use App\Enums\WorkMode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJobPostingRequest extends FormRequest
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
     * "sometimes" allows partial updates (PATCH): a field is only validated when it is sent.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'salary' => ['sometimes', 'required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'work_mode' => ['sometimes', 'required', Rule::enum(WorkMode::class)],
            'contract_type' => ['sometimes', 'required', Rule::enum(ContractType::class)],
            'skills' => ['sometimes', 'nullable', 'array', 'max:15'],
            'skills.*' => ['integer', 'distinct', Rule::exists('skills', 'id')],
        ];
    }
}
