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
     * Applies the listing filters (title, work_mode, contract_type).
     *
     * @param  Builder<self>  $query
     * @param  array<string, mixed>  $filters
     */
    public function scopeApplyFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['title'] ?? null, fn (Builder $q, string $title) => $q->where('title', 'like', "%{$title}%"))
            ->when($filters['work_mode'] ?? null, fn (Builder $q, $workMode) => $q->where('work_mode', $workMode))
            ->when($filters['contract_type'] ?? null, fn (Builder $q, $contractType) => $q->where('contract_type', $contractType));
    }
}
