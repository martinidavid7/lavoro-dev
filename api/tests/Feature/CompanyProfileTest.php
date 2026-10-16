<?php

use App\Enums\CompanySize;
use App\Models\CompanyProfile;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

beforeEach(fn () => app()->setLocale('it'));

describe('public company page', function () {
    it('shows the company with its profile and the number of job postings', function () {
        $profile = CompanyProfile::factory()->create(['city' => 'Torino', 'size' => CompanySize::Medium]);
        JobPosting::factory(2)->for($profile->user, 'company')->create();

        $this->getJson("/api/companies/{$profile->user_id}")
            ->assertOk()
            ->assertJsonPath('data.name', $profile->user->name)
            ->assertJsonPath('data.city', 'Torino')
            ->assertJsonPath('data.size', '51-200')
            ->assertJsonPath('data.size_label', '51-200 dipendenti')
            ->assertJsonPath('data.job_postings_count', 2);
    });

    it('shows a company that has not filled in its profile yet', function () {
        $company = User::factory()->company()->create();

        $this->getJson("/api/companies/{$company->id}")
            ->assertOk()
            ->assertJsonPath('data.name', $company->name)
            ->assertJsonPath('data.description', null)
            ->assertJsonPath('data.logo_url', null);
    });

    it('returns 404 for candidates', function () {
        $candidate = User::factory()->candidate()->create();

        $this->getJson("/api/companies/{$candidate->id}")->assertNotFound();
    });
});

describe('editing the profile', function () {
    it('creates the profile and renames the company', function () {
        $company = Sanctum::actingAs(User::factory()->company()->create());

        $this->patchJson('/api/company-profile', [
            'name' => 'Martini Software',
            'description' => 'Software gestionale per le PMI.',
            'sector' => 'Software e SaaS',
            'city' => 'Bologna',
            'size' => '11-50',
            'website' => 'https://example.com',
            'contact_email' => 'info@example.com',
            'phone' => '+39 051 123 4567',
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Martini Software')
            ->assertJsonPath('data.city', 'Bologna')
            ->assertJsonPath('data.size_label', '11-50 dipendenti');

        expect($company->fresh()->companyProfile)
            ->sector->toBe('Software e SaaS')
            ->size->toBe(CompanySize::Small);
    });

    it('updates the existing profile, clearing optional fields', function () {
        $profile = CompanyProfile::factory()->create();
        Sanctum::actingAs($profile->user);

        $this->patchJson('/api/company-profile', ['name' => 'Nuovo nome', 'phone' => null])->assertOk();

        expect(CompanyProfile::count())->toBe(1)
            ->and($profile->fresh()->phone)->toBeNull();
    });

    it('validates the fields with Italian messages', function () {
        Sanctum::actingAs(User::factory()->company()->create());

        $this->patchJson('/api/company-profile', [
            'name' => '',
            'size' => 'tantissimi',
            'website' => 'non-un-sito',
            'contact_email' => 'non-una-email',
            'phone' => 'chiamami',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'size', 'website', 'contact_email', 'phone'])
            ->assertJsonPath('errors.website.0', 'Il campo sito web deve essere un URL valido.');
    });

    it('is only for companies', function () {
        Sanctum::actingAs(User::factory()->candidate()->create());

        $this->patchJson('/api/company-profile', ['name' => 'Finta Azienda'])->assertForbidden();
    });

    it('requires authentication', function () {
        $this->patchJson('/api/company-profile', ['name' => 'Anonima'])->assertUnauthorized();
    });
});

describe('logo', function () {
    beforeEach(fn () => Storage::fake('public'));

    it('uploads a logo, replacing the previous one', function () {
        $company = Sanctum::actingAs(User::factory()->company()->create());

        $this->post('/api/company-profile/logo', ['logo' => UploadedFile::fake()->image('vecchio.png')], ['Accept' => 'application/json'])
            ->assertOk();
        $previous = $company->companyProfile()->value('logo_path');

        $this->post('/api/company-profile/logo', ['logo' => UploadedFile::fake()->image('nuovo.png')], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.logo_url', fn (string $url) => str_contains($url, '/storage/logos/'));

        $current = $company->companyProfile()->value('logo_path');

        Storage::disk('public')->assertMissing($previous);
        Storage::disk('public')->assertExists($current);
    });

    it('rejects files that are not images or are too big', function (UploadedFile $file) {
        Sanctum::actingAs(User::factory()->company()->create());

        $this->post('/api/company-profile/logo', ['logo' => $file], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('logo');
    })->with([
        'pdf' => fn () => UploadedFile::fake()->create('logo.pdf', 100, 'application/pdf'),
        'over 1 MB' => fn () => UploadedFile::fake()->image('logo.png')->size(2048),
    ]);

    it('removes the logo', function () {
        $company = Sanctum::actingAs(User::factory()->company()->create());
        $this->post('/api/company-profile/logo', ['logo' => UploadedFile::fake()->image('logo.png')], ['Accept' => 'application/json']);
        $path = $company->companyProfile()->value('logo_path');

        $this->deleteJson('/api/company-profile/logo')
            ->assertOk()
            ->assertJsonPath('data.logo_url', null);

        Storage::disk('public')->assertMissing($path);
    });

    it('is only for companies', function () {
        Sanctum::actingAs(User::factory()->candidate()->create());

        $this->post('/api/company-profile/logo', ['logo' => UploadedFile::fake()->image('logo.png')], ['Accept' => 'application/json'])
            ->assertForbidden();
    });
});

it('includes the company logo in the job postings', function () {
    Storage::fake('public');
    $profile = CompanyProfile::factory()->create(['logo_path' => 'logos/acme.png']);
    JobPosting::factory()->for($profile->user, 'company')->create();

    $this->getJson('/api/job-postings')
        ->assertOk()
        ->assertJsonPath('data.0.company.logo_url', Storage::disk('public')->url('logos/acme.png'));
});
