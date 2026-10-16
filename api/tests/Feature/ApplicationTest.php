<?php

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\CandidateProfile;
use App\Models\JobPosting;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    app()->setLocale('it');
    Storage::fake('local');
});

/** A candidate with a CV in the profile. */
function candidateWithCv(): User
{
    Storage::disk('local')->put('cvs/giulia.pdf', '%PDF-1.4 cv');

    return CandidateProfile::factory()
        ->create(['cv_path' => 'cvs/giulia.pdf', 'cv_name' => 'CV Giulia.pdf'])
        ->user;
}

describe('applying', function () {
    it('applies with a copy of the CV and a cover letter', function () {
        $candidate = Sanctum::actingAs(candidateWithCv());
        $jobPosting = JobPosting::factory()->create();

        $this->postJson("/api/job-postings/{$jobPosting->id}/applications", [
            'cover_letter' => 'Vorrei lavorare con voi.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'in_review')
            ->assertJsonPath('data.status_label', 'In valutazione')
            ->assertJsonPath('data.cv_name', 'CV Giulia.pdf')
            ->assertJsonPath('data.job_posting.id', $jobPosting->id);

        $application = Application::sole();
        expect($application)
            ->candidate_id->toBe($candidate->id)
            ->cover_letter->toBe('Vorrei lavorare con voi.')
            ->cv_path->not->toBe('cvs/giulia.pdf');
        Storage::disk('local')->assertExists($application->cv_path);
    });

    it('keeps the CV sent even if the candidate removes it from the profile', function () {
        $candidate = Sanctum::actingAs(candidateWithCv());
        $jobPosting = JobPosting::factory()->create();
        $this->postJson("/api/job-postings/{$jobPosting->id}/applications")->assertCreated();

        $this->deleteJson('/api/candidate-profile/cv')->assertOk();

        Storage::disk('local')->assertMissing('cvs/giulia.pdf');
        Storage::disk('local')->assertExists(Application::sole()->cv_path);
        expect($candidate->candidateProfile->fresh()->cv_path)->toBeNull();
    });

    it('requires a CV in the profile', function () {
        Sanctum::actingAs(User::factory()->candidate()->create());
        $jobPosting = JobPosting::factory()->create();

        $this->postJson("/api/job-postings/{$jobPosting->id}/applications")
            ->assertUnprocessable()
            ->assertJsonPath('errors.cv.0', 'Carica il tuo curriculum nel profilo prima di candidarti.');
    });

    it('does not let a candidate apply twice', function () {
        Sanctum::actingAs(candidateWithCv());
        $jobPosting = JobPosting::factory()->create();
        $this->postJson("/api/job-postings/{$jobPosting->id}/applications")->assertCreated();

        $this->postJson("/api/job-postings/{$jobPosting->id}/applications")
            ->assertUnprocessable()
            ->assertJsonPath('errors.job_posting.0', 'Ti sei già candidato a questa offerta.');

        expect(Application::count())->toBe(1);
    });

    it('is only for candidates', function () {
        Sanctum::actingAs(User::factory()->company()->create());
        $jobPosting = JobPosting::factory()->create();

        $this->postJson("/api/job-postings/{$jobPosting->id}/applications")->assertForbidden();
    });

    it('requires authentication', function () {
        $jobPosting = JobPosting::factory()->create();

        $this->postJson("/api/job-postings/{$jobPosting->id}/applications")->assertUnauthorized();
    });
});

describe("the candidate's applications", function () {
    it('lists only their own applications, newest first, with the job posting', function () {
        $candidate = Sanctum::actingAs(User::factory()->candidate()->create());
        $older = Application::factory()->for($candidate, 'candidate')->create(['created_at' => now()->subDay()]);
        $newer = Application::factory()->for($candidate, 'candidate')->status(ApplicationStatus::Interview)->create();
        Application::factory()->create();

        $this->getJson('/api/applications')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.0.status_label', 'Colloquio')
            ->assertJsonPath('data.0.job_posting.company.name', $newer->jobPosting->company->name)
            ->assertJsonPath('data.1.id', $older->id)
            ->assertJsonMissingPath('data.0.candidate');
    });

    it('lets the candidate withdraw an application, deleting the CV copy', function () {
        $candidate = Sanctum::actingAs(User::factory()->candidate()->create());
        $application = Application::factory()->for($candidate, 'candidate')->create();
        Storage::disk('local')->put($application->cv_path, '%PDF');

        $this->deleteJson("/api/applications/{$application->id}")->assertNoContent();

        $this->assertModelMissing($application);
        Storage::disk('local')->assertMissing($application->cv_path);
    });

    it('does not let the candidate withdraw once hired, nor touch other applications', function () {
        $candidate = Sanctum::actingAs(User::factory()->candidate()->create());
        $hired = Application::factory()->for($candidate, 'candidate')->status(ApplicationStatus::Hired)->create();
        $someoneElses = Application::factory()->create();

        $this->deleteJson("/api/applications/{$hired->id}")->assertForbidden();
        $this->deleteJson("/api/applications/{$someoneElses->id}")->assertForbidden();
    });
});

describe('the company and the applicants', function () {
    it('lists the applicants with their profile, filtered by status, with the counts', function () {
        $jobPosting = JobPosting::factory()->create();
        Sanctum::actingAs($jobPosting->company);
        $profile = CandidateProfile::factory()->create(['headline' => 'Sviluppatrice Vue']);
        $profile->user->skills()->attach(Skill::factory()->create(['name' => 'Vue.js']));
        $interview = Application::factory()->for($jobPosting)->for($profile->user, 'candidate')
            ->status(ApplicationStatus::Interview)->create();
        Application::factory(2)->for($jobPosting)->create();
        Application::factory()->for($jobPosting)->status(ApplicationStatus::Rejected)->create();
        Application::factory()->create();

        $this->getJson("/api/job-postings/{$jobPosting->id}/applications?status=interview")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $interview->id)
            ->assertJsonPath('data.0.candidate.headline', 'Sviluppatrice Vue')
            ->assertJsonPath('data.0.candidate.skills.0.name', 'Vue.js')
            ->assertJsonPath('meta.counts', [
                'in_review' => 2,
                'interview' => 1,
                'rejected' => 1,
                'hired' => 0,
                'all' => 4,
            ]);
    });

    it('changes the status', function () {
        $this->freezeSecond();
        $application = Application::factory()->create();
        Sanctum::actingAs($application->jobPosting->company);

        $this->patchJson("/api/applications/{$application->id}", ['status' => 'hired'])
            ->assertOk()
            ->assertJsonPath('data.status', 'hired')
            ->assertJsonPath('data.status_label', 'Assunto');

        expect($application->fresh())
            ->status->toBe(ApplicationStatus::Hired)
            ->status_changed_at->toEqual(now());
    });

    it('rejects an unknown status', function () {
        $application = Application::factory()->create();
        Sanctum::actingAs($application->jobPosting->company);

        $this->patchJson("/api/applications/{$application->id}", ['status' => 'forse'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    });

    it('downloads the CV sent by the applicant', function () {
        $application = Application::factory()->create(['cv_name' => 'CV Marco.pdf']);
        Storage::disk('local')->put($application->cv_path, '%PDF');
        Sanctum::actingAs($application->jobPosting->company);

        $this->get("/api/applications/{$application->id}/cv")->assertOk()->assertDownload('CV Marco.pdf');
    });

    it('keeps other companies and candidates out', function () {
        $application = Application::factory()->create();
        Storage::disk('local')->put($application->cv_path, '%PDF');

        foreach ([User::factory()->company()->create(), User::factory()->candidate()->create()] as $stranger) {
            Sanctum::actingAs($stranger);

            $this->getJson("/api/job-postings/{$application->job_posting_id}/applications")->assertForbidden();
            $this->patchJson("/api/applications/{$application->id}", ['status' => 'hired'])->assertForbidden();
            $this->getJson("/api/applications/{$application->id}/cv")->assertForbidden();
        }

        expect($application->fresh()->status)->toBe(ApplicationStatus::InReview);
    });
});
