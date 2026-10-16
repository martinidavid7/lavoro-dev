<?php

namespace App\Policies;

use App\Models\JobPosting;
use App\Models\User;

/**
 * Listing and viewing are public (no policy check); only companies publish,
 * and only the company that published a job posting can change it.
 */
class JobPostingPolicy
{
    public function create(User $user): bool
    {
        return $user->isCompany();
    }

    public function update(User $user, JobPosting $jobPosting): bool
    {
        return $user->id === $jobPosting->company_id;
    }

    public function delete(User $user, JobPosting $jobPosting): bool
    {
        return $user->id === $jobPosting->company_id;
    }
}
