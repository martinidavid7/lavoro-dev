<?php

use App\Models\JobPosting;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('saves, lists and removes favorite job postings', function () {
    $candidate = Sanctum::actingAs(User::factory()->candidate()->create());
    [$first, $second] = JobPosting::factory(2)->create();

    $this->putJson("/api/favorites/{$first->id}")->assertNoContent();
    $this->travel(1)->minute();
    $this->putJson("/api/favorites/{$second->id}")->assertNoContent();
    $this->putJson("/api/favorites/{$second->id}")->assertNoContent();

    $this->getJson('/api/favorites')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $second->id)
        ->assertJsonPath('data.0.company.name', $second->company->name)
        ->assertJsonPath('data.1.id', $first->id);

    $this->deleteJson("/api/favorites/{$first->id}")->assertNoContent();

    expect($candidate->favorites()->pluck('job_postings.id')->all())->toBe([$second->id]);
});

it('keeps each candidate favorites separate', function () {
    $jobPosting = JobPosting::factory()->create();
    User::factory()->candidate()->create()->favorites()->attach($jobPosting);

    Sanctum::actingAs(User::factory()->candidate()->create());

    $this->getJson('/api/favorites')->assertOk()->assertJsonCount(0, 'data');
});

it('forgets the favorite when the job posting is deleted', function () {
    $candidate = User::factory()->candidate()->create();
    $jobPosting = JobPosting::factory()->create();
    $candidate->favorites()->attach($jobPosting);

    $jobPosting->delete();

    expect($candidate->favorites()->count())->toBe(0);
});

it('is only for candidates', function () {
    Sanctum::actingAs(User::factory()->company()->create());
    $jobPosting = JobPosting::factory()->create();

    $this->getJson('/api/favorites')->assertForbidden();
    $this->putJson("/api/favorites/{$jobPosting->id}")->assertForbidden();
});

it('requires authentication', function () {
    $this->getJson('/api/favorites')->assertUnauthorized();
});
