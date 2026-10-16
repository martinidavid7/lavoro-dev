<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCompanyProfileRequest;
use App\Http\Resources\CompanyResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * The logged in company's own profile.
 */
class CompanyProfileController extends Controller
{
    /**
     * PATCH /api/company-profile
     */
    public function update(UpdateCompanyProfileRequest $request): CompanyResource
    {
        /** @var User $company */
        $company = $request->user();

        $company->update($request->safe()->only('name'));
        $company->companyProfile()->updateOrCreate([], $request->safe()->except('name'));

        return $this->resource($company);
    }

    /**
     * POST /api/company-profile/logo — multipart upload; replaces the previous logo.
     */
    public function storeLogo(Request $request): CompanyResource
    {
        /** @var User $company */
        $company = $request->user();
        abort_unless($company->isCompany(), 403);

        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1024', 'dimensions:max_width=2000,max_height=2000'],
        ]);

        $profile = $company->companyProfile()->firstOrCreate();
        $previous = $profile->logo_path;

        $profile->update(['logo_path' => $request->file('logo')->store('logos', 'public')]);

        if ($previous) {
            Storage::disk('public')->delete($previous);
        }

        return $this->resource($company);
    }

    /**
     * DELETE /api/company-profile/logo
     */
    public function destroyLogo(Request $request): CompanyResource
    {
        /** @var User $company */
        $company = $request->user();
        abort_unless($company->isCompany(), 403);

        $profile = $company->companyProfile;

        if ($profile?->logo_path) {
            Storage::disk('public')->delete($profile->logo_path);
            $profile->update(['logo_path' => null]);
        }

        return $this->resource($company);
    }

    private function resource(User $company): CompanyResource
    {
        return new CompanyResource($company->load('companyProfile')->loadCount('jobPostings'));
    }
}
