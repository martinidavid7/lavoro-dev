<?php

use App\Enums\UserRole;
use App\Models\User;

/*
 * These tests go through the real session (cookie) flow, as the SPA does: requests
 * coming from a stateful domain (the Origin header) get Sanctum's session middleware.
 */
beforeEach(function () {
    app()->setLocale('it');
    config(['sanctum.stateful' => ['localhost:5173']]);
    $this->withHeader('Origin', 'http://localhost:5173');
});

describe('registration', function () {
    it('registers a company and logs it in', function () {
        $this->postJson('/api/register', [
            'name' => 'Acme S.r.l.',
            'email' => 'acme@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'company',
        ])
            ->assertCreated()
            ->assertJsonPath('data.email', 'acme@example.com')
            ->assertJsonPath('data.role', 'company')
            ->assertJsonPath('data.role_label', 'Azienda')
            ->assertJsonMissingPath('data.password');

        $this->assertAuthenticated();
        expect(User::sole()->role)->toBe(UserRole::Company);
    });

    it('validates the fields with Italian messages', function () {
        User::factory()->create(['email' => 'preso@example.com']);

        $this->postJson('/api/register', [
            'name' => '',
            'email' => 'preso@example.com',
            'password' => 'corta',
            'password_confirmation' => 'diversa',
            'role' => 'admin',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password', 'role'])
            ->assertJsonPath('errors.email.0', 'Il valore del campo email è già in uso.');

        $this->assertGuest();
    });
});

describe('login and logout', function () {
    it('logs in with valid credentials', function () {
        $user = User::factory()->candidate()->create(['email' => 'giulia@example.com']);

        $this->postJson('/api/login', ['email' => 'giulia@example.com', 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.role', 'candidate');

        $this->assertAuthenticatedAs($user);
    });

    it('rejects wrong credentials with an Italian message', function () {
        User::factory()->create(['email' => 'giulia@example.com']);

        $this->postJson('/api/login', ['email' => 'giulia@example.com', 'password' => 'sbagliata'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'Email o password non corretti.');

        $this->assertGuest();
    });

    it('returns the logged in user, then logs out', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->postJson('/api/logout')->assertNoContent();

        $this->assertGuest('web');
    });

    it('returns 401 for guests', function () {
        $this->getJson('/api/user')->assertUnauthorized();
    });
});
