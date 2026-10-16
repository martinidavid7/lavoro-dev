<?php

namespace App\Http\Controllers;

use App\Http\Resources\SkillResource;
use App\Models\Skill;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SkillController extends Controller
{
    /**
     * GET /api/skills — the whole catalog (a few dozen skills), alphabetical.
     */
    public function index(): AnonymousResourceCollection
    {
        return SkillResource::collection(Skill::query()->orderBy('name')->get());
    }
}
