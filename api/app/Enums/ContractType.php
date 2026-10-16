<?php

namespace App\Enums;

enum ContractType: int
{
    case Permanent = 1;
    case FixedTerm = 2;
    case Freelance = 3;
    case Internship = 4;

    public function label(): string
    {
        return __("enums.contract_type.{$this->name}");
    }
}
