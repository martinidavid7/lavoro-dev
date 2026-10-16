<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CompanyProfileController;
use App\Http\Controllers\JobPostingController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

Route::apiResource('job-postings', JobPostingController::class)->only(['index', 'show']);
Route::get('/companies/{company}', [CompanyController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::patch('/company-profile', [CompanyProfileController::class, 'update']);
    Route::post('/company-profile/logo', [CompanyProfileController::class, 'storeLogo']);
    Route::delete('/company-profile/logo', [CompanyProfileController::class, 'destroyLogo']);

    Route::apiResource('job-postings', JobPostingController::class)->except(['index', 'show']);
});
