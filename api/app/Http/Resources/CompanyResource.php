<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public page of a company: a user with the company role plus its profile,
 * which stays empty (null fields) until the company fills it in.
 *
 * @mixin User
 */
class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $profile = $this->companyProfile;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $profile?->description,
            'sector' => $profile?->sector,
            'city' => $profile?->city,
            'size' => $profile?->size?->value,
            'size_label' => $profile?->size?->label(),
            'website' => $profile?->website,
            'contact_email' => $profile?->contact_email,
            'phone' => $profile?->phone,
            'logo_url' => $profile?->logoUrl(),
            'job_postings_count' => $this->whenCounted('jobPostings'),
        ];
    }
}
