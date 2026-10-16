<?php

use App\Enums\ContractType;
use App\Enums\WorkMode;
use App\Models\JobPosting;
use App\Models\Skill;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(fn () => app()->setLocale('it'));

describe('listing', function () {
    it('lists job postings paginated, newest first, with their company', function () {
        $older = JobPosting::factory()->create(['published_at' => now()->subDays(5)]);
        $newer = JobPosting::factory()->create(['published_at' => now()]);

        $this->getJson('/api/job-postings')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.1.id', $older->id)
            ->assertJsonPath('data.0.company.name', $newer->company->name)
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

    it('filters by company', function () {
        $company = User::factory()->company()->create();
        JobPosting::factory(2)->for($company, 'company')->create();
        JobPosting::factory()->create();

        $this->getJson("/api/job-postings?company={$company->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.company.id', $company->id)
            ->assertJsonPath('data.1.company.id', $company->id);
    });

    it('filters by skills, best matches first', function () {
        [$vue, $php, $docker] = Skill::factory(3)->create();
        $oneMatch = JobPosting::factory()->hasAttached($vue)->create(['published_at' => now()]);
        $twoMatches = JobPosting::factory()->hasAttached([$vue, $php])->create(['published_at' => now()->subDay()]);
        JobPosting::factory()->hasAttached($docker)->create();
        JobPosting::factory()->create();

        $this->getJson("/api/job-postings?skills[]={$vue->id}&skills[]={$php->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $twoMatches->id)
            ->assertJsonPath('data.1.id', $oneMatch->id)
            ->assertJsonCount(2, 'data.0.skills');
    });

    it('rejects invalid filters', function () {
        $this->getJson('/api/job-postings?work_mode=99')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('work_mode');
    });
});

describe('creation', function () {
    it('creates a job posting owned by the logged in company, published by the server', function () {
        $this->freezeSecond();
        $company = Sanctum::actingAs(User::factory()->company()->create());

        $this->postJson('/api/job-postings', [
            'title' => 'Sviluppatore Laravel',
            'description' => 'Posizione per lavorare con API REST.',
            'salary' => 42000.50,
            'work_mode' => WorkMode::Hybrid->value,
            'contract_type' => ContractType::Permanent->value,
        ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Sviluppatore Laravel')
            ->assertJsonPath('data.company.id', $company->id)
            ->assertJsonPath('data.work_mode_label', 'Ibrido')
            ->assertJsonPath('data.contract_type_label', 'Tempo indeterminato');

        expect(JobPosting::sole())
            ->company_id->toBe($company->id)
            ->salary->toBe('42000.50')
            ->published_at->toEqual(now());
    });

    it('saves the required skills', function () {
        Sanctum::actingAs(User::factory()->company()->create());
        [$vue, $php] = Skill::factory(2)->sequence(['name' => 'Vue.js'], ['name' => 'PHP'])->create();

        $this->postJson('/api/job-postings', JobPosting::factory()->raw([
            'company_id' => null,
            'skills' => [$vue->id, $php->id],
        ]))
            ->assertCreated()
            ->assertJsonPath('data.skills.*.name', ['PHP', 'Vue.js']);
    });

    it('rejects unknown skills', function () {
        Sanctum::actingAs(User::factory()->company()->create());

        $this->postJson('/api/job-postings', JobPosting::factory()->raw(['company_id' => null, 'skills' => [999]]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('skills.0');
    });

    it('validates the required fields with Italian messages', function () {
        Sanctum::actingAs(User::factory()->company()->create());

        $this->postJson('/api/job-postings', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'description', 'salary', 'work_mode', 'contract_type'])
            ->assertJsonPath('errors.title.0', 'Il campo titolo è obbligatorio.');
    });

    it('rejects a negative salary or one with more than two decimal places', function (mixed $salary) {
        Sanctum::actingAs(User::factory()->company()->create());

        $this->postJson('/api/job-postings', JobPosting::factory()->raw(['salary' => $salary]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('salary');
    })->with([-1, 10.555]);

    it('requires authentication', function () {
        $this->postJson('/api/job-postings', JobPosting::factory()->raw())->assertUnauthorized();
    });

    it('does not let candidates publish', function () {
        Sanctum::actingAs(User::factory()->candidate()->create());

        $this->postJson('/api/job-postings', JobPosting::factory()->raw())->assertForbidden();

        expect(JobPosting::count())->toBe(0);
    });
});

describe('show, update and delete', function () {
    it('shows a job posting', function () {
        $jobPosting = JobPosting::factory()->create();

        $this->getJson("/api/job-postings/{$jobPosting->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $jobPosting->id)
            ->assertJsonPath('data.company.id', $jobPosting->company_id);
    });

    it('returns 404 for a missing job posting', function () {
        $this->getJson('/api/job-postings/999')->assertNotFound();
    });

    it('lets the owner partially update a job posting', function () {
        $jobPosting = JobPosting::factory()->create(['title' => 'Vecchio']);
        Sanctum::actingAs($jobPosting->company);

        $this->patchJson("/api/job-postings/{$jobPosting->id}", ['title' => 'Nuovo titolo'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Nuovo titolo')
            ->assertJsonPath('data.description', $jobPosting->description);
    });

    it('lets the owner delete a job posting', function () {
        $jobPosting = JobPosting::factory()->create();
        Sanctum::actingAs($jobPosting->company);

        $this->deleteJson("/api/job-postings/{$jobPosting->id}")->assertNoContent();

        $this->assertModelMissing($jobPosting);
    });

    it('does not let another company change or delete it', function () {
        $jobPosting = JobPosting::factory()->create(['title' => 'Originale']);
        Sanctum::actingAs(User::factory()->company()->create());

        $this->patchJson("/api/job-postings/{$jobPosting->id}", ['title' => 'Modificato'])->assertForbidden();
        $this->deleteJson("/api/job-postings/{$jobPosting->id}")->assertForbidden();

        expect($jobPosting->fresh()->title)->toBe('Originale');
    });

    it('requires authentication to change or delete', function () {
        $jobPosting = JobPosting::factory()->create();

        $this->patchJson("/api/job-postings/{$jobPosting->id}", ['title' => 'Modificato'])->assertUnauthorized();
        $this->deleteJson("/api/job-postings/{$jobPosting->id}")->assertUnauthorized();
    });
});
