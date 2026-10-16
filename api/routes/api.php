<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CandidateProfileController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CompanyProfileController;
use App\Http\Controllers\JobPostingApplicationController;
use App\Http\Controllers\JobPostingController;
use App\Http\Controllers\SkillController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

Route::apiResource('job-postings', JobPostingController::class)->only(['index', 'show']);
Route::get('/companies/{company}', [CompanyController::class, 'show']);
Route::get('/skills', [SkillController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::patch('/company-profile', [CompanyProfileController::class, 'update']);
    Route::post('/company-profile/logo', [CompanyProfileController::class, 'storeLogo']);
    Route::delete('/company-profile/logo', [CompanyProfileController::class, 'destroyLogo']);

    Route::get('/candidate-profile', [CandidateProfileController::class, 'show']);
    Route::patch('/candidate-profile', [CandidateProfileController::class, 'update']);
    Route::post('/candidate-profile/photo', [CandidateProfileController::class, 'storePhoto']);
    Route::delete('/candidate-profile/photo', [CandidateProfileController::class, 'destroyPhoto']);
    Route::post('/candidate-profile/cv', [CandidateProfileController::class, 'storeCv']);
    Route::get('/candidate-profile/cv', [CandidateProfileController::class, 'downloadCv']);
    Route::delete('/candidate-profile/cv', [CandidateProfileController::class, 'destroyCv']);

    Route::get('/job-postings/{jobPosting}/applications', [JobPostingApplicationController::class, 'index']);
    Route::post('/job-postings/{jobPosting}/applications', [JobPostingApplicationController::class, 'store']);
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::patch('/applications/{application}', [ApplicationController::class, 'update']);
    Route::delete('/applications/{application}', [ApplicationController::class, 'destroy']);
    Route::get('/applications/{application}/cv', [ApplicationController::class, 'downloadCv']);

    Route::apiResource('job-postings', JobPostingController::class)->except(['index', 'show']);
});
