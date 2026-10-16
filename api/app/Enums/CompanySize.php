<?php

namespace App\Enums;

/**
 * Number of employees, in the ranges commonly used by job boards.
 */
enum CompanySize: string
{
    case Micro = '1-10';
    case Small = '11-50';
    case Medium = '51-200';
    case Large = '201-500';
    case Enterprise = '500+';

    public function label(): string
    {
        return __("enums.company_size.{$this->name}");
    }
}
