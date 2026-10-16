<?php

namespace Database\Factories;

use App\Enums\ContractType;
use App\Enums\WorkMode;
use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Sample data is in Italian, the language of the user interface.
 *
 * @extends Factory<JobPosting>
 */
class JobPostingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $role = fake()->randomElement([
            'Sviluppatore Back-end PHP',
            'Sviluppatore Laravel',
            'Sviluppatore Front-end Vue.js',
            'Sviluppatore Full Stack',
            'Sviluppatore React',
            'Data Engineer',
            'QA Engineer',
            'DevOps Engineer',
            'UX/UI Designer',
            'Tech Lead',
        ]);
        $level = fake()->randomElement(['Junior', 'Mid', 'Senior']);
        $stack = implode(', ', fake()->randomElements(
            ['PHP', 'Laravel', 'Vue.js', 'TypeScript', 'MySQL', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'Git'],
            4,
        ));

        return [
            'title' => "{$role} {$level}",
            'description' => "Cerchiamo una persona {$level} da inserire nel nostro team di prodotto.\n\n"
                ."Stack: {$stack}.\n\n"
                .'Benefit: buoni pasto, assicurazione sanitaria integrativa, smart working e orario flessibile.',
            // Gross annual salary (RAL), as is customary in Italian job postings.
            'salary' => fake()->numberBetween(24, 65) * 1000,
            'published_at' => fake()->dateTimeBetween('-30 days'),
            'work_mode' => fake()->randomElement(WorkMode::cases()),
            'contract_type' => fake()->randomElement(ContractType::cases()),
        ];
    }
}
