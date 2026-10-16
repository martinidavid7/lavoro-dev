<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCandidateProfileRequest extends FormRequest
{
    /**
     * Only candidates have this profile.
     */
    public function authorize(): bool
    {
        return $this->user()->isCandidate();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * The name lives on the user; every other field is optional.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\s().-]+$/'],
            'city' => ['nullable', 'string', 'max:100'],
            'headline' => ['nullable', 'string', 'max:100'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:50'],
            'bio' => ['nullable', 'string', 'max:3000'],
            'linkedin_url' => ['nullable', 'url:https', 'max:255', 'regex:/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i'],
            'github_url' => ['nullable', 'url:https', 'max:255', 'regex:/^https:\/\/(www\.)?github\.com\//i'],
            'portfolio_url' => ['nullable', 'url:http,https', 'max:255'],
            'skills' => ['nullable', 'array', 'max:30'],
            'skills.*' => ['integer', 'distinct', Rule::exists('skills', 'id')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'linkedin_url.regex' => 'Inserisci il link al tuo profilo LinkedIn (https://www.linkedin.com/in/...).',
            'github_url.regex' => 'Inserisci il link al tuo profilo GitHub (https://github.com/...).',
        ];
    }
}
