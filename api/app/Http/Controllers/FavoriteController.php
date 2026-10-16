<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobPostingResource;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * The logged in candidate's favorite job postings.
 */
class FavoriteController extends Controller
{
    /**
     * GET /api/favorites — most recently saved first.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return JobPostingResource::collection(
            $this->candidate($request)->favorites()
                ->with(['company.companyProfile', 'skills'])
                ->orderByPivot('created_at', 'desc')
                ->get(),
        );
    }

    /**
     * PUT /api/favorites/{jobPosting} — saving it again changes nothing.
     */
    public function store(Request $request, JobPosting $jobPosting): Response
    {
        $this->candidate($request)->favorites()->syncWithoutDetaching([$jobPosting->id]);

        return response()->noContent();
    }

    /**
     * DELETE /api/favorites/{jobPosting}
     */
    public function destroy(Request $request, JobPosting $jobPosting): Response
    {
        $this->candidate($request)->favorites()->detach($jobPosting);

        return response()->noContent();
    }

    private function candidate(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user->isCandidate(), 403);

        return $user;
    }
}
