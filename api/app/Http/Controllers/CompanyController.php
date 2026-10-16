<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Resources\CompanyResource;
use App\Models\User;

class CompanyController extends Controller
{
    /**
     * GET /api/companies/{company} — public company page; its job postings come
     * from GET /api/job-postings?company={id}.
     */
    public function show(User $company): CompanyResource
    {
        abort_unless($company->role === UserRole::Company, 404);

        return new CompanyResource($company->load('companyProfile')->loadCount('jobPostings'));
    }
}
