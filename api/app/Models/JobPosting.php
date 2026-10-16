<?php

namespace App\Models;

use App\Enums\ContractType;
use App\Enums\WorkMode;
use Database\Factories\JobPostingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['title', 'description', 'salary', 'published_at', 'work_mode', 'contract_type'])]
class JobPosting extends Model
{
    /** @use HasFactory<JobPostingFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'salary' => 'decimal:2',
            'work_mode' => WorkMode::class,
            'contract_type' => ContractType::class,
        ];
    }

    /**
     * The company (a user with the company role) that published the job posting.
     *
     * @return BelongsTo<User, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(User::class, 'company_id');
    }

    /**
     * Skills required by the job posting.
     *
     * @return BelongsToMany<Skill, $this>
     */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class)->orderBy('name');
    }

    /**
     * Applies the listing filters (title, work_mode, contract_type, company, skills).
     *
     * skills: job postings requiring at least one of them, best matches first.
     *
     * @param  Builder<self>  $query
     * @param  array<string, mixed>  $filters
     */
    public function scopeApplyFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['title'] ?? null, fn (Builder $q, string $title) => $q->where('title', 'like', "%{$title}%"))
            ->when($filters['work_mode'] ?? null, fn (Builder $q, $workMode) => $q->where('work_mode', $workMode))
            ->when($filters['contract_type'] ?? null, fn (Builder $q, $contractType) => $q->where('contract_type', $contractType))
            ->when($filters['company'] ?? null, fn (Builder $q, $companyId) => $q->where('company_id', $companyId))
            ->when($filters['skills'] ?? null, fn (Builder $q, array $skillIds) => $q
                ->whereHas('skills', fn (Builder $skills) => $skills->whereKey($skillIds))
                ->withCount(['skills as matching_skills_count' => fn (Builder $skills) => $skills->whereKey($skillIds)])
                ->orderByDesc('matching_skills_count'));
    }
}
