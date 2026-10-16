<?php

namespace Database\Factories;

use App\Enums\CompanySize;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Sample data is in Italian, the language of the user interface.
 *
 * @extends Factory<CompanyProfile>
 */
class CompanyProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sector = fake()->randomElement([
            'Software e SaaS',
            'E-commerce',
            'Fintech',
            'Consulenza IT',
            'Agenzia digitale',
            'Telecomunicazioni',
        ]);

        return [
            'user_id' => User::factory()->company(),
            'description' => "Siamo un'azienda del settore {$sector} con un team di prodotto in crescita.\n\n"
                .'Lavoriamo con metodologie agili, crediamo nella formazione continua e nel lavoro da remoto.',
            'sector' => $sector,
            'city' => fake()->randomElement(['Milano', 'Roma', 'Torino', 'Bologna', 'Firenze', 'Napoli']),
            'size' => fake()->randomElement(CompanySize::cases()),
            'website' => fake()->url(),
            'contact_email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
        ];
    }
}
