<?php

namespace App\Http\Resources;

use App\Models\JobPosting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin JobPosting
 */
class JobPostingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company' => $this->whenLoaded('company', fn () => [
                'id' => $this->company->id,
                'name' => $this->company->name,
                'logo_url' => $this->company->companyProfile?->logoUrl(),
            ]),
            'title' => $this->title,
            'description' => $this->description,
            'salary' => $this->salary,
            'work_mode' => $this->work_mode?->value,
            'work_mode_label' => $this->work_mode?->label(),
            'contract_type' => $this->contract_type?->value,
            'contract_type_label' => $this->contract_type?->label(),
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
