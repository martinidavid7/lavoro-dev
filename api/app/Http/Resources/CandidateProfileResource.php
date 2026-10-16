<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A candidate with its profile, which stays empty (null fields) until the candidate fills it in.
 *
 * @mixin User
 */
class CandidateProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $profile = $this->candidateProfile;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $profile?->phone,
            'city' => $profile?->city,
            'headline' => $profile?->headline,
            'experience_years' => $profile?->experience_years,
            'bio' => $profile?->bio,
            'linkedin_url' => $profile?->linkedin_url,
            'github_url' => $profile?->github_url,
            'portfolio_url' => $profile?->portfolio_url,
            'photo_url' => $profile?->photoUrl(),
            'cv' => $profile?->cv_path ? [
                'name' => $profile->cv_name,
                'updated_at' => $profile->updated_at?->toIso8601String(),
            ] : null,
            'skills' => SkillResource::collection($this->whenLoaded('skills')),
        ];
    }
}
