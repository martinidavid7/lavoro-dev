<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * A candidate applies once per job posting.
     * status: values mapped by the App\Enums\ApplicationStatus enum.
     * cv_path/cv_name: copy of the candidate's CV when applying (private "local" disk), so the
     * company keeps the CV it received even if the candidate later replaces or removes it.
     */
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();
            $table->text('cover_letter')->nullable();
            $table->string('cv_path');
            $table->string('cv_name');
            $table->string('status', 20)->default('in_review')->index();
            $table->timestamp('status_changed_at')->nullable();
            $table->timestamps();

            $table->unique(['job_posting_id', 'candidate_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
