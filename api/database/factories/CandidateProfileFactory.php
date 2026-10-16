<?php

namespace Database\Factories;

use App\Models\CandidateProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Sample data is in Italian, the language of the user interface.
 *
 * @extends Factory<CandidateProfile>
 */
class CandidateProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $headline = fake()->randomElement([
            'Sviluppatore Front-end',
            'Sviluppatore Back-end',
            'Sviluppatore Full Stack',
            'DevOps Engineer',
            'UX/UI Designer',
        ]);

        return [
            'user_id' => User::factory()->candidate(),
            'phone' => fake()->phoneNumber(),
            'city' => fake()->randomElement(['Milano', 'Roma', 'Torino', 'Bologna', 'Firenze', 'Napoli']),
            'headline' => $headline,
            'experience_years' => fake()->numberBetween(0, 15),
            'bio' => "{$headline} appassionato di prodotti digitali, sempre alla ricerca di nuove sfide.",
            'linkedin_url' => 'https://www.linkedin.com/in/'.fake()->userName(),
            'github_url' => 'https://github.com/'.fake()->userName(),
            'portfolio_url' => null,
        ];
    }
}
