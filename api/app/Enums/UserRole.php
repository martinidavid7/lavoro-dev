<?php

namespace App\Enums;

enum UserRole: string
{
    case Company = 'company';
    case Candidate = 'candidate';

    public function label(): string
    {
        return __("enums.user_role.{$this->name}");
    }
}
