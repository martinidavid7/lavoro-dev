<?php

namespace App\Http\Controllers;

use App\Enums\ContractType;
use App\Enums\WorkMode;
use App\Http\Requests\StoreJobPostingRequest;
use App\Http\Requests\UpdateJobPostingRequest;
use App\Http\Resources\JobPostingResource;
use App\Models\JobPosting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class JobPostingController extends Controller
{
    /**
     * GET /api/job-postings — paginated list, newest first.
     *
     * Optional query string filters: ?title=dev&work_mode=1&contract_type=2
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'title' => ['nullable', 'string', 'max:100'],
            'work_mode' => ['nullable', Rule::enum(WorkMode::class)],
            'contract_type' => ['nullable', Rule::enum(ContractType::class)],
        ]);

        $jobPostings = JobPosting::query()
            ->applyFilters($filters)
            ->orderByDesc('published_at')
            ->paginate(10)
            ->withQueryString();

        return JobPostingResource::collection($jobPostings);
    }

    /**
     * POST /api/job-postings
     */
    public function store(StoreJobPostingRequest $request): JobPostingResource
    {
        $jobPosting = JobPosting::create([
            ...$request->validated(),
            'published_at' => now(),
        ]);

        return new JobPostingResource($jobPosting);
    }

    /**
     * GET /api/job-postings/{jobPosting}
     */
    public function show(JobPosting $jobPosting): JobPostingResource
    {
        return new JobPostingResource($jobPosting);
    }

    /**
     * PUT/PATCH /api/job-postings/{jobPosting}
     */
    public function update(UpdateJobPostingRequest $request, JobPosting $jobPosting): JobPostingResource
    {
        $jobPosting->update($request->validated());

        return new JobPostingResource($jobPosting);
    }

    /**
     * DELETE /api/job-postings/{jobPosting}
     */
    public function destroy(JobPosting $jobPosting): Response
    {
        $jobPosting->delete();

        return response()->noContent();
    }
}
