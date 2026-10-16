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
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class JobPostingController extends Controller
{
    /** Relations returned with every job posting. */
    private const RELATIONS = ['company.companyProfile', 'skills'];

    /**
     * GET /api/job-postings — paginated list, newest first.
     *
     * Optional query string filters: ?title=dev&work_mode=1&contract_type=2&company=5&skills[]=3&skills[]=7
     * With skills, the job postings matching more of them come first.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'title' => ['nullable', 'string', 'max:100'],
            'work_mode' => ['nullable', Rule::enum(WorkMode::class)],
            'contract_type' => ['nullable', Rule::enum(ContractType::class)],
            'company' => ['nullable', 'integer', 'min:1'],
            'skills' => ['nullable', 'array', 'max:30'],
            'skills.*' => ['integer', 'min:1'],
        ]);

        $jobPostings = JobPosting::query()
            ->with(self::RELATIONS)
            ->applyFilters($filters)
            ->orderByDesc('published_at')
            ->paginate(10)
            ->withQueryString();

        return JobPostingResource::collection($jobPostings);
    }

    /**
     * POST /api/job-postings — only companies; the job posting belongs to the logged in company.
     */
    public function store(StoreJobPostingRequest $request): JobPostingResource
    {
        Gate::authorize('create', JobPosting::class);

        $jobPosting = $request->user()->jobPostings()->create([
            ...$request->safe()->except('skills'),
            'published_at' => now(),
        ]);
        $jobPosting->skills()->sync($request->validated('skills', []));

        return new JobPostingResource($jobPosting->load(self::RELATIONS));
    }

    /**
     * GET /api/job-postings/{jobPosting}
     */
    public function show(JobPosting $jobPosting): JobPostingResource
    {
        return new JobPostingResource($jobPosting->load(self::RELATIONS));
    }

    /**
     * PUT/PATCH /api/job-postings/{jobPosting} — only the company that published it.
     */
    public function update(UpdateJobPostingRequest $request, JobPosting $jobPosting): JobPostingResource
    {
        Gate::authorize('update', $jobPosting);

        $jobPosting->update($request->safe()->except('skills'));

        if ($request->has('skills')) {
            $jobPosting->skills()->sync($request->validated('skills', []));
        }

        return new JobPostingResource($jobPosting->load(self::RELATIONS));
    }

    /**
     * DELETE /api/job-postings/{jobPosting} — only the company that published it.
     */
    public function destroy(JobPosting $jobPosting): Response
    {
        Gate::authorize('delete', $jobPosting);

        $jobPosting->delete();

        return response()->noContent();
    }
}
