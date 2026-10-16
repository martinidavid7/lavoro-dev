<?php

namespace Database\Factories;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Sample data is in Italian, the language of the user interface.
 *
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'job_posting_id' => JobPosting::factory(),
            'candidate_id' => User::factory()->candidate(),
            'cover_letter' => 'Buongiorno, la vostra offerta mi interessa molto: allego il mio curriculum.',
            'cv_path' => 'applications/cv-'.fake()->uuid().'.pdf',
            'cv_name' => 'Curriculum.pdf',
            'status' => ApplicationStatus::InReview,
        ];
    }

    public function status(ApplicationStatus $status): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $status,
            'status_changed_at' => now(),
        ]);
    }
}
