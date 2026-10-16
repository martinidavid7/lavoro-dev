<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Session (cookie) authentication for the SPA, through Sanctum's stateful API.
 * The SPA must call GET /sanctum/csrf-cookie before these routes.
 */
class AuthController extends Controller
{
    /**
     * POST /api/register — creates the account and logs it in (201).
     */
    public function register(RegisterRequest $request): UserResource
    {
        $user = User::create($request->validated());

        Auth::login($user);
        $request->session()->regenerate();

        return new UserResource($user);
    }

    /**
     * POST /api/login
     */
    public function login(LoginRequest $request): UserResource
    {
        if (! Auth::attempt($request->validated(), $request->boolean('remember'))) {
            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        $request->session()->regenerate();

        return new UserResource($request->user());
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    /**
     * GET /api/user — the logged in user.
     */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
