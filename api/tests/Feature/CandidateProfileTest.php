<?php

use App\Models\Application;
use App\Models\JobPosting;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

beforeEach(fn () => app()->setLocale('it'));

describe('profile', function () {
    it('shows an empty profile to a candidate who has not filled it in', function () {
        $candidate = Sanctum::actingAs(User::factory()->candidate()->create());

        $this->getJson('/api/candidate-profile')
            ->assertOk()
            ->assertJsonPath('data.name', $candidate->name)
            ->assertJsonPath('data.email', $candidate->email)
            ->assertJsonPath('data.headline', null)
            ->assertJsonPath('data.cv', null)
            ->assertJsonPath('data.skills', []);
    });

    it('saves the profile and the skills', function () {
        $candidate = Sanctum::actingAs(User::factory()->candidate()->create());
        [$vue, $php, $docker] = Skill::factory(3)->sequence(['name' => 'Vue.js'], ['name' => 'PHP'], ['name' => 'Docker'])->create();
        $candidate->skills()->attach($docker);

        $this->patchJson('/api/candidate-profile', [
            'name' => 'Giulia Rossi',
            'phone' => '+39 333 123 4567',
            'city' => 'Bologna',
            'headline' => 'Sviluppatrice Front-end',
            'experience_years' => 4,
            'bio' => 'Mi occupo di interfacce accessibili.',
            'linkedin_url' => 'https://www.linkedin.com/in/giuliarossi',
            'github_url' => 'https://github.com/giuliarossi',
            'portfolio_url' => 'https://giuliarossi.dev',
            'skills' => [$vue->id, $php->id],
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Giulia Rossi')
            ->assertJsonPath('data.headline', 'Sviluppatrice Front-end')
            ->assertJsonPath('data.experience_years', 4)
            ->assertJsonPath('data.skills.*.name', ['PHP', 'Vue.js']);

        expect($candidate->fresh()->skills->pluck('id')->all())->toEqualCanonicalizing([$vue->id, $php->id]);
    });

    it('keeps the skills when they are not sent', function () {
        $candidate = Sanctum::actingAs(User::factory()->candidate()->create());
        $candidate->skills()->attach(Skill::factory()->create());

        $this->patchJson('/api/candidate-profile', ['name' => 'Nuovo nome'])->assertOk();

        expect($candidate->skills()->count())->toBe(1);
    });

    it('validates the fields with Italian messages', function () {
        Sanctum::actingAs(User::factory()->candidate()->create());

        $this->patchJson('/api/candidate-profile', [
            'name' => '',
            'experience_years' => 80,
            'linkedin_url' => 'https://example.com/giulia',
            'github_url' => 'non-un-link',
            'skills' => [999],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'experience_years', 'linkedin_url', 'github_url', 'skills.0'])
            ->assertJsonPath('errors.linkedin_url.0', 'Inserisci il link al tuo profilo LinkedIn (https://www.linkedin.com/in/...).');
    });

    it('is only for candidates', function () {
        Sanctum::actingAs(User::factory()->company()->create());

        $this->getJson('/api/candidate-profile')->assertForbidden();
        $this->patchJson('/api/candidate-profile', ['name' => 'Azienda'])->assertForbidden();
    });

    it('requires authentication', function () {
        $this->getJson('/api/candidate-profile')->assertUnauthorized();
    });
});

describe('photo', function () {
    beforeEach(fn () => Storage::fake('public'));

    it('uploads a photo, replacing the previous one, and removes it', function () {
        $candidate = Sanctum::actingAs(User::factory()->candidate()->create());

        $this->post('/api/candidate-profile/photo', ['photo' => UploadedFile::fake()->image('vecchia.jpg')], ['Accept' => 'application/json'])
            ->assertOk();
        $previous = $candidate->candidateProfile()->value('photo_path');

        $this->post('/api/candidate-profile/photo', ['photo' => UploadedFile::fake()->image('nuova.jpg')], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.photo_url', fn (string $url) => str_contains($url, '/storage/photos/'));
        $current = $candidate->candidateProfile()->value('photo_path');

        Storage::disk('public')->assertMissing($previous);
        Storage::disk('public')->assertExists($current);

        $this->deleteJson('/api/candidate-profile/photo')->assertOk()->assertJsonPath('data.photo_url', null);
        Storage::disk('public')->assertMissing($current);
    });

    it('rejects files that are not images', function () {
        Sanctum::actingAs(User::factory()->candidate()->create());

        $this->post('/api/candidate-profile/photo', ['photo' => UploadedFile::fake()->create('foto.pdf', 10, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('photo');
    });
});

describe('CV', function () {
    beforeEach(fn () => Storage::fake('local'));

    it('uploads the CV on the private disk and downloads it with its original name', function () {
        $candidate = Sanctum::actingAs(User::factory()->candidate()->create());

        $this->post('/api/candidate-profile/cv', ['cv' => UploadedFile::fake()->create('CV Giulia Rossi.pdf', 200, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.cv.name', 'CV Giulia Rossi.pdf');

        $path = $candidate->candidateProfile()->value('cv_path');
        Storage::disk('local')->assertExists($path);

        $this->get('/api/candidate-profile/cv')
            ->assertOk()
            ->assertDownload('CV Giulia Rossi.pdf');
    });

    it('replaces and removes the CV, deleting the old files', function () {
        $candidate = Sanctum::actingAs(User::factory()->candidate()->create());

        $this->post('/api/candidate-profile/cv', ['cv' => UploadedFile::fake()->create('vecchio.pdf', 100, 'application/pdf')], ['Accept' => 'application/json']);
        $previous = $candidate->candidateProfile()->value('cv_path');
        $this->post('/api/candidate-profile/cv', ['cv' => UploadedFile::fake()->create('nuovo.pdf', 100, 'application/pdf')], ['Accept' => 'application/json']);
        $current = $candidate->candidateProfile()->value('cv_path');

        Storage::disk('local')->assertMissing($previous);

        $this->deleteJson('/api/candidate-profile/cv')->assertOk()->assertJsonPath('data.cv', null);
        Storage::disk('local')->assertMissing($current);
        $this->get('/api/candidate-profile/cv', ['Accept' => 'application/json'])->assertNotFound();
    });

    it('only accepts PDF files up to 5 MB', function (UploadedFile $file) {
        Sanctum::actingAs(User::factory()->candidate()->create());

        $this->post('/api/candidate-profile/cv', ['cv' => $file], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('cv');
    })->with([
        'Word document' => fn () => UploadedFile::fake()->create('cv.docx', 100, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        'over 5 MB' => fn () => UploadedFile::fake()->create('cv.pdf', 6000, 'application/pdf'),
    ]);

    it('is only for candidates', function () {
        Sanctum::actingAs(User::factory()->company()->create());

        $this->post('/api/candidate-profile/cv', ['cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertForbidden();
    });
});

it('lists the skills catalog alphabetically', function () {
    Skill::factory()->create(['name' => 'Vue.js']);
    Skill::factory()->create(['name' => 'Docker']);

    $this->getJson('/api/skills')
        ->assertOk()
        ->assertJsonPath('data.*.name', ['Docker', 'Vue.js']);
});

it('seeds the demo data', function () {
    Storage::fake('local');

    $this->seed();

    $demoCandidate = User::where('email', 'candidato@example.com')->sole();
    expect($demoCandidate)
        ->candidateProfile->not->toBeNull()
        ->skills->not->toBeEmpty()
        ->applications->toHaveCount(1);
    expect(Application::count())->toBe(8);
    Storage::disk('local')->assertExists(Application::first()->cv_path);

    // Job postings get skills that fit their role.
    $frontEndSkills = ['Vue.js', 'TypeScript', 'JavaScript', 'Pinia', 'Vite', 'Tailwind CSS', 'Vitest'];
    JobPosting::where('title', 'like', 'Sviluppatore Front-end Vue.js%')->with('skills')->get()
        ->each(fn (JobPosting $job) => expect($job->skills->pluck('name')->diff($frontEndSkills))->toBeEmpty());
    expect(JobPosting::doesntHave('skills')->count())->toBe(0);
});
