<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicationController extends Controller
{
    /**
     * GET /api/applications — the logged in candidate's applications, newest first.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var User $candidate */
        $candidate = $request->user();
        abort_unless($candidate->isCandidate(), 403);

        return ApplicationResource::collection(
            $candidate->applications()->with('jobPosting.company.companyProfile')->latest()->get(),
        );
    }

    /**
     * PATCH /api/applications/{application} — the company changes the status.
     */
    public function update(Request $request, Application $application): ApplicationResource
    {
        Gate::authorize('update', $application);

        $data = $request->validate([
            'status' => ['required', Rule::enum(ApplicationStatus::class)],
        ]);

        $application->update([
            'status' => $data['status'],
            'status_changed_at' => now(),
        ]);

        return new ApplicationResource($application->load(['candidate.candidateProfile', 'candidate.skills']));
    }

    /**
     * DELETE /api/applications/{application} — the candidate withdraws the application.
     */
    public function destroy(Application $application): Response
    {
        Gate::authorize('delete', $application);

        Storage::disk('local')->delete($application->cv_path);
        $application->delete();

        return response()->noContent();
    }

    /**
     * GET /api/applications/{application}/cv — the CV sent with the application.
     */
    public function downloadCv(Application $application): StreamedResponse
    {
        Gate::authorize('downloadCv', $application);

        abort_unless(Storage::disk('local')->exists($application->cv_path), 404);

        return Storage::disk('local')->download($application->cv_path, $application->cv_name);
    }
}
