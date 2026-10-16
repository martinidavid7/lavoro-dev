<?php

namespace App\Http\Requests;

use App\Enums\CompanySize;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyProfileRequest extends FormRequest
{
    /**
     * Only companies have a profile.
     */
    public function authorize(): bool
    {
        return $this->user()->isCompany();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * The company name lives on the user; every other field is optional.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'sector' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'size' => ['nullable', Rule::enum(CompanySize::class)],
            'website' => ['nullable', 'url:http,https', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\s().-]+$/'],
        ];
    }
}
