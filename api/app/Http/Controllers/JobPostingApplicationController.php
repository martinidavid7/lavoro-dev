<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Applications to one job posting.
 */
class JobPostingApplicationController extends Controller
{
    /**
     * GET /api/job-postings/{jobPosting}/applications?status=interview — the company's view,
     * newest first, with how many applications are in each status.
     */
    public function index(Request $request, JobPosting $jobPosting): AnonymousResourceCollection
    {
        Gate::authorize('viewApplications', $jobPosting);

        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(ApplicationStatus::class)],
        ]);

        $applications = $jobPosting->applications()
            ->with(['candidate.candidateProfile', 'candidate.skills'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->get();

        $counts = $jobPosting->applications()
            ->toBase()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return ApplicationResource::collection($applications)->additional([
            'meta' => [
                'counts' => collect(ApplicationStatus::cases())
                    ->mapWithKeys(fn (ApplicationStatus $status) => [$status->value => (int) ($counts[$status->value] ?? 0)])
                    ->put('all', (int) $counts->sum()),
            ],
        ]);
    }

    /**
     * POST /api/job-postings/{jobPosting}/applications — a candidate applies, sending a copy
     * of the CV in their profile and an optional cover letter.
     */
    public function store(Request $request, JobPosting $jobPosting): ApplicationResource
    {
        Gate::authorize('apply', $jobPosting);

        /** @var User $candidate */
        $candidate = $request->user();

        $data = $request->validate([
            'cover_letter' => ['nullable', 'string', 'max:3000'],
        ]);

        if ($candidate->applications()->whereBelongsTo($jobPosting)->exists()) {
            throw ValidationException::withMessages(['job_posting' => __('applications.already_applied')]);
        }

        $profile = $candidate->candidateProfile;

        if (! $profile?->cv_path || ! Storage::disk('local')->exists($profile->cv_path)) {
            throw ValidationException::withMessages(['cv' => __('applications.cv_required')]);
        }

        $cvPath = 'applications/'.Str::uuid().'.pdf';
        Storage::disk('local')->copy($profile->cv_path, $cvPath);

        $application = new Application([
            'cover_letter' => $data['cover_letter'] ?? null,
            'cv_path' => $cvPath,
            'cv_name' => $profile->cv_name,
        ]);
        $application->jobPosting()->associate($jobPosting);
        $application->candidate()->associate($candidate);
        $application->save();

        return new ApplicationResource($application->load('jobPosting.company.companyProfile'));
    }
}
