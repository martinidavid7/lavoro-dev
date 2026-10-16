<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCandidateProfileRequest;
use App\Http\Resources\CandidateProfileResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The logged in candidate's own profile. The photo is public; the CV is stored on the
 * private "local" disk and only downloaded through the API.
 */
class CandidateProfileController extends Controller
{
    /**
     * GET /api/candidate-profile
     */
    public function show(Request $request): CandidateProfileResource
    {
        return $this->resource($this->candidate($request));
    }

    /**
     * PATCH /api/candidate-profile — the skills are replaced by the given list.
     */
    public function update(UpdateCandidateProfileRequest $request): CandidateProfileResource
    {
        /** @var User $candidate */
        $candidate = $request->user();

        $candidate->update($request->safe()->only('name'));
        $candidate->candidateProfile()->updateOrCreate([], $request->safe()->except('name', 'skills'));

        if ($request->has('skills')) {
            $candidate->skills()->sync($request->validated('skills', []));
        }

        return $this->resource($candidate);
    }

    /**
     * POST /api/candidate-profile/photo — multipart upload; replaces the previous photo.
     */
    public function storePhoto(Request $request): CandidateProfileResource
    {
        $candidate = $this->candidate($request);

        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1024', 'dimensions:max_width=2000,max_height=2000'],
        ]);

        $this->replaceFile($candidate, 'photo_path', 'public', $request->file('photo')->store('photos', 'public'));

        return $this->resource($candidate);
    }

    /**
     * DELETE /api/candidate-profile/photo
     */
    public function destroyPhoto(Request $request): CandidateProfileResource
    {
        $candidate = $this->candidate($request);

        $this->replaceFile($candidate, 'photo_path', 'public', null);

        return $this->resource($candidate);
    }

    /**
     * POST /api/candidate-profile/cv — PDF only, up to 5 MB; replaces the previous CV.
     */
    public function storeCv(Request $request): CandidateProfileResource
    {
        $candidate = $this->candidate($request);

        $request->validate([
            'cv' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ]);

        $file = $request->file('cv');
        $this->replaceFile($candidate, 'cv_path', 'local', $file->store('cvs', 'local'));
        $candidate->candidateProfile->update(['cv_name' => $file->getClientOriginalName()]);

        return $this->resource($candidate);
    }

    /**
     * GET /api/candidate-profile/cv — downloads the candidate's own CV.
     */
    public function downloadCv(Request $request): StreamedResponse
    {
        $profile = $this->candidate($request)->candidateProfile;

        abort_unless($profile?->cv_path && Storage::disk('local')->exists($profile->cv_path), 404);

        return Storage::disk('local')->download($profile->cv_path, $profile->cv_name);
    }

    /**
     * DELETE /api/candidate-profile/cv
     */
    public function destroyCv(Request $request): CandidateProfileResource
    {
        $candidate = $this->candidate($request);

        $this->replaceFile($candidate, 'cv_path', 'local', null);
        $candidate->candidateProfile->update(['cv_name' => null]);

        return $this->resource($candidate);
    }

    private function candidate(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user->isCandidate(), 403);

        return $user;
    }

    /**
     * Saves a new file path (or null) on the profile and deletes the previous file.
     */
    private function replaceFile(User $candidate, string $column, string $disk, ?string $path): void
    {
        $profile = $candidate->candidateProfile()->firstOrCreate();
        $previous = $profile->{$column};

        $profile->update([$column => $path]);
        $candidate->setRelation('candidateProfile', $profile);

        if ($previous) {
            Storage::disk($disk)->delete($previous);
        }
    }

    private function resource(User $candidate): CandidateProfileResource
    {
        return new CandidateProfileResource($candidate->load('candidateProfile', 'skills'));
    }
}
