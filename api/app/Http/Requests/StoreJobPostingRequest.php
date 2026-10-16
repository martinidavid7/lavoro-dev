<?php

namespace App\Http\Requests;

use App\Enums\ContractType;
use App\Enums\WorkMode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJobPostingRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'salary' => ['required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'work_mode' => ['required', Rule::enum(WorkMode::class)],
            'contract_type' => ['required', Rule::enum(ContractType::class)],
        ];
    }
}
