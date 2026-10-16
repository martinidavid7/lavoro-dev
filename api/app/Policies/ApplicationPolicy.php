<?php

namespace App\Policies;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\User;

/**
 * The company that published the job posting manages its applications;
 * the candidate sees and withdraws their own.
 */
class ApplicationPolicy
{
    /**
     * Changing the status (in review, interview, rejected, hired).
     */
    public function update(User $user, Application $application): bool
    {
        return $user->id === $application->jobPosting->company_id;
    }

    /**
     * Downloading the CV sent with the application.
     */
    public function downloadCv(User $user, Application $application): bool
    {
        return $user->id === $application->candidate_id
            || $user->id === $application->jobPosting->company_id;
    }

    /**
     * Withdrawing the application: the candidate's own, unless already hired.
     */
    public function delete(User $user, Application $application): bool
    {
        return $user->id === $application->candidate_id
            && $application->status !== ApplicationStatus::Hired;
    }
}
