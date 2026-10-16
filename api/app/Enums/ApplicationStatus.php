<?php

namespace App\Enums;

/**
 * Where an application stands in the company's selection process.
 */
enum ApplicationStatus: string
{
    case InReview = 'in_review';
    case Interview = 'interview';
    case Rejected = 'rejected';
    case Hired = 'hired';

    public function label(): string
    {
        return __("enums.application_status.{$this->name}");
    }
}
