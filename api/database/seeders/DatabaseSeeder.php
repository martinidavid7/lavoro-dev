<?php

namespace Database\Seeders;

use App\Enums\CompanySize;
use App\Models\CandidateProfile;
use App\Models\CompanyProfile;
use App\Models\JobPosting;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
    }
}
