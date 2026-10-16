<?php

namespace Database\Seeders;

use App\Enums\CompanySize;
use App\Models\CompanyProfile;
use App\Models\JobPosting;
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

        User::factory()->candidate()->create([
            'name' => 'Giulia Rossi',
            'email' => 'candidato@example.com',
        ]);

        JobPosting::factory(5)->for($demoCompany, 'company')->create();

        User::factory(5)
            ->company()
            ->has(CompanyProfile::factory())
            ->has(JobPosting::factory(5), 'jobPostings')
            ->create();
    }
}
