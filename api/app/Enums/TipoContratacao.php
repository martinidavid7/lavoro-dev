<?php

namespace App\Enums;

enum TipoContratacao: int
{
    case CLT = 1;
    case PJ = 2;

    public function label(): string
    {
        return match ($this) {
            self::CLT => 'CLT',
            self::PJ => 'PJ',
        };
    }
}
