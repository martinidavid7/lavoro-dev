<?php

namespace App\Enums;

enum WorkMode: int
{
    case Remote = 1;
    case OnSite = 2;
    case Hybrid = 3;

    public function label(): string
    {
        return __("enums.work_mode.{$this->name}");
    }
}
