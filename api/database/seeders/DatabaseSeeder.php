<?php

namespace Database\Seeders;

use App\Enums\ApplicationStatus;
use App\Enums\CompanySize;
use App\Models\Application;
use App\Models\CandidateProfile;
use App\Models\CompanyProfile;
use App\Models\JobPosting;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Demo logins (password "password"): azienda@example.com and candidato@example.com.
     */
    public function run(): void
    {
        $this->call(SkillSeeder::class);
        $skills = Skill::all();

        $demoCompany = User::factory()
            ->company()
            ->has(CompanyProfile::factory()->state([
                'sector' => 'Software e SaaS',
                'city' => 'Milano',
                'size' => CompanySize::Small,
                'website' => 'https://lavoro.dev',
                'contact_email' => 'lavora-con-noi@example.com',
                'phone' => '+39 02 1234 5678',
            ]))
            ->create([
                'name' => 'Lavoro Demo S.r.l.',
                'email' => 'azienda@example.com',
            ]);

        $demoCandidate = User::factory()
            ->candidate()
            ->has(CandidateProfile::factory()->state([
                'headline' => 'Sviluppatrice Front-end',
                'city' => 'Bologna',
                'experience_years' => 4,
            ]))
            ->create([
                'name' => 'Giulia Rossi',
                'email' => 'candidato@example.com',
            ]);
        $demoCandidate->skills()->attach($skills->whereIn('name', ['Vue.js', 'TypeScript', 'JavaScript', 'Pinia', 'Tailwind CSS'])->pluck('id'));

        JobPosting::factory(5)->for($demoCompany, 'company')->create();

        User::factory(5)
            ->company()
            ->has(CompanyProfile::factory())
            ->has(JobPosting::factory(5), 'jobPostings')
            ->create();

        JobPosting::all()->each(
            fn (JobPosting $jobPosting) => $jobPosting->skills()->attach($skills->random(rand(3, 6))->pluck('id')),
        );

        $this->seedApplications($demoCompany->jobPostings()->first(), $demoCandidate, $skills);
    }

    /**
     * Applicants with different statuses for the demo company, so its panel is not empty.
     * The CVs are placeholder PDFs on the private disk.
     *
     * @param  Collection<int, Skill>  $skills
     */
    private function seedApplications(JobPosting $jobPosting, User $demoCandidate, Collection $skills): void
    {
        $statuses = [
            ApplicationStatus::InReview, ApplicationStatus::InReview, ApplicationStatus::InReview,
            ApplicationStatus::Interview, ApplicationStatus::Interview,
            ApplicationStatus::Rejected, ApplicationStatus::Hired,
        ];

        $candidates = User::factory(count($statuses))
            ->candidate()
            ->has(CandidateProfile::factory())
            ->create()
            ->each(fn (User $candidate) => $candidate->skills()->attach($skills->random(5)->pluck('id')));

        foreach ($candidates->prepend($demoCandidate)->values() as $index => $candidate) {
            $cvPath = "applications/demo-{$candidate->id}.pdf";
            Storage::disk('local')->put($cvPath, self::PLACEHOLDER_PDF);

            Application::factory()
                ->for($jobPosting)
                ->for($candidate, 'candidate')
                ->status($statuses[$index - 1] ?? ApplicationStatus::InReview)
                ->create(['cv_path' => $cvPath, 'cv_name' => "CV {$candidate->name}.pdf"]);
        }
    }

    /** A valid one-page PDF with no content. */
    private const PLACEHOLDER_PDF = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        ."2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        ."3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\n"
        ."trailer<</Root 1 0 R>>\n%%EOF\n";
}
