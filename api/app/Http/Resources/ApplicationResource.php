<?php

namespace App\Http\Resources;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An application, as seen by the candidate (with the job posting) or by the
 * company (with the candidate's profile).
 *
 * @mixin Application
 */
class ApplicationResource extends JsonResource
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
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_changed_at' => $this->status_changed_at?->toIso8601String(),
            'cover_letter' => $this->cover_letter,
            'cv_name' => $this->cv_name,
            'created_at' => $this->created_at?->toIso8601String(),
            'job_posting' => $this->whenLoaded('jobPosting', fn () => [
                'id' => $this->jobPosting->id,
                'title' => $this->jobPosting->title,
                'company' => [
                    'id' => $this->jobPosting->company->id,
                    'name' => $this->jobPosting->company->name,
                    'logo_url' => $this->jobPosting->company->companyProfile?->logoUrl(),
                ],
            ]),
            'candidate' => $this->whenLoaded('candidate', fn () => $this->candidateData()),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function candidateData(): array
    {
        $candidate = $this->candidate;
        $profile = $candidate->candidateProfile;

        return [
            'id' => $candidate->id,
            'name' => $candidate->name,
            'email' => $candidate->email,
            'phone' => $profile?->phone,
            'city' => $profile?->city,
            'headline' => $profile?->headline,
            'experience_years' => $profile?->experience_years,
            'bio' => $profile?->bio,
            'photo_url' => $profile?->photoUrl(),
            'linkedin_url' => $profile?->linkedin_url,
            'github_url' => $profile?->github_url,
            'portfolio_url' => $profile?->portfolio_url,
            'skills' => SkillResource::collection($candidate->skills),
        ];
    }
}
