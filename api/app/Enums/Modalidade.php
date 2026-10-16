<?php

namespace App\Enums;

enum Modalidade: int
{
    case HomeOffice = 1;
    case Presencial = 2;

    public function label(): string
    {
        return match ($this) {
            self::HomeOffice => 'Home Office',
            self::Presencial => 'Presencial',
        };
    }
}
