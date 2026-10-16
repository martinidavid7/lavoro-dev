<?php

namespace Database\Factories;

use App\Enums\Modalidade;
use App\Enums\TipoContratacao;
use App\Models\Vaga;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vaga>
 */
class VagaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cargo = fake()->randomElement([
            'Desenvolvedor(a) Back-end PHP',
            'Desenvolvedor(a) Laravel',
            'Desenvolvedor(a) Front-end Vue.js',
            'Desenvolvedor(a) Full Stack',
            'Desenvolvedor(a) React',
            'Engenheiro(a) de Dados',
            'Analista de QA',
            'DevOps Engineer',
            'UX/UI Designer',
            'Tech Lead',
        ]);
        $nivel = fake()->randomElement(['Júnior', 'Pleno', 'Sênior']);
        $stack = implode(', ', fake()->randomElements(
            ['PHP', 'Laravel', 'Vue.js', 'TypeScript', 'MySQL', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'Git'],
            4,
        ));

        return [
            'titulo' => "{$cargo} {$nivel}",
            'descricao' => "Buscamos uma pessoa {$nivel} para integrar nosso time de produto.\n\n"
                ."Stack: {$stack}.\n\n"
                .'Benefícios: plano de saúde, vale-refeição, auxílio home office e horário flexível.',
            'salario' => fake()->randomFloat(2, 2000, 20000),
            'publicacao' => fake()->dateTimeBetween('-30 days'),
            'modalidade' => fake()->randomElement(Modalidade::cases()),
            'tipo' => fake()->randomElement(TipoContratacao::cases()),
        ];
    }
}
