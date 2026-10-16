<?php

use App\Enums\ContractType;
use App\Enums\WorkMode;
use App\Models\JobPosting;

beforeEach(fn () => app()->setLocale('it'));

describe('listing', function () {
    it('lists job postings paginated, newest first', function () {
        $older = JobPosting::factory()->create(['published_at' => now()->subDays(5)]);
        $newer = JobPosting::factory()->create(['published_at' => now()]);

        $this->getJson('/api/job-postings')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.1.id', $older->id)
            ->assertJsonStructure(['data', 'links', 'meta' => ['current_page', 'last_page', 'total']]);
    });

    it('filters by title', function () {
        JobPosting::factory()->create(['title' => 'Sviluppatore Vue Mid']);
        JobPosting::factory()->create(['title' => 'Analista Finanziario']);

        $this->getJson('/api/job-postings?title=vue')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Sviluppatore Vue Mid');
    });

    it('filters by work mode and contract type', function () {
        JobPosting::factory()->create(['work_mode' => WorkMode::Remote, 'contract_type' => ContractType::Freelance]);
        JobPosting::factory()->create(['work_mode' => WorkMode::Remote, 'contract_type' => ContractType::Permanent]);
        JobPosting::factory()->create(['work_mode' => WorkMode::OnSite, 'contract_type' => ContractType::Freelance]);

        $this->getJson('/api/job-postings?work_mode=1&contract_type=3')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('rejects invalid filters', function () {
        $this->getJson('/api/job-postings?work_mode=99')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('work_mode');
    });
});

describe('creation', function () {
    it('creates a job posting with the publication date set by the server', function () {
        $this->freezeSecond();

        $this->postJson('/api/job-postings', [
            'title' => 'Sviluppatore Laravel',
            'description' => 'Posizione per lavorare con API REST.',
            'salary' => 42000.50,
            'work_mode' => WorkMode::Hybrid->value,
            'contract_type' => ContractType::Permanent->value,
        ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Sviluppatore Laravel')
            ->assertJsonPath('data.work_mode_label', 'Ibrido')
            ->assertJsonPath('data.contract_type_label', 'Tempo indeterminato');

        expect(JobPosting::sole())
            ->salary->toBe('42000.50')
            ->published_at->toEqual(now());
    });

    it('validates the required fields with Italian messages', function () {
        $this->postJson('/api/job-postings', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'description', 'salary', 'work_mode', 'contract_type'])
            ->assertJsonPath('errors.title.0', 'Il campo titolo è obbligatorio.');
    });

    it('rejects a negative salary or one with more than two decimal places', function (mixed $salary) {
        $this->postJson('/api/job-postings', JobPosting::factory()->raw(['salary' => $salary]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('salary');
    })->with([-1, 10.555]);
});

describe('show, update and delete', function () {
    it('shows a job posting', function () {
        $jobPosting = JobPosting::factory()->create();

        $this->getJson("/api/job-postings/{$jobPosting->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $jobPosting->id);
    });

    it('returns 404 for a missing job posting', function () {
        $this->getJson('/api/job-postings/999')->assertNotFound();
    });

    it('partially updates a job posting', function () {
        $jobPosting = JobPosting::factory()->create(['title' => 'Vecchio']);

        $this->patchJson("/api/job-postings/{$jobPosting->id}", ['title' => 'Nuovo titolo'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Nuovo titolo')
            ->assertJsonPath('data.description', $jobPosting->description);
    });

    it('deletes a job posting', function () {
        $jobPosting = JobPosting::factory()->create();

        $this->deleteJson("/api/job-postings/{$jobPosting->id}")->assertNoContent();

        $this->assertModelMissing($jobPosting);
    });
});
