<?php

namespace Database\Seeders;

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
        $demoCompany = User::factory()->company()->create([
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
            ->has(JobPosting::factory(5), 'jobPostings')
            ->create();
    }
}
