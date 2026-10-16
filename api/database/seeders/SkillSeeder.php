<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

/**
 * The skills catalog. Safe to run again: existing skills are kept.
 */
class SkillSeeder extends Seeder
{
    public const SKILLS = [
        // Front-end
        'JavaScript', 'TypeScript', 'Vue.js', 'Nuxt', 'React', 'Next.js', 'Angular', 'Svelte',
        'HTML', 'CSS', 'Tailwind CSS', 'Sass', 'Pinia', 'Vite', 'Webpack',
        // Back-end
        'PHP', 'Laravel', 'Symfony', 'Node.js', 'NestJS', 'Express', 'Python', 'Django',
        'Java', 'Spring', 'C#', '.NET', 'Go', 'Ruby on Rails',
        // Data
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQL',
        // APIs and testing
        'REST API', 'GraphQL', 'Vitest', 'Jest', 'Cypress', 'Playwright', 'PHPUnit', 'Pest',
        // DevOps and cloud
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'CI/CD', 'Linux', 'Git', 'Terraform',
        // Mobile and design
        'Flutter', 'React Native', 'Swift', 'Kotlin', 'Figma', 'UX/UI',
        // Methods
        'Agile', 'Scrum',
    ];

    public function run(): void
    {
        $now = now();

        Skill::query()->insertOrIgnore(array_map(
            fn (string $name) => ['name' => $name, 'created_at' => $now, 'updated_at' => $now],
            self::SKILLS,
        ));
    }
}
