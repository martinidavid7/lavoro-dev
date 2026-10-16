<?php

use App\Http\Controllers\VagaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('vagas', VagaController::class)
    ->parameters(['vagas' => 'vaga']);
