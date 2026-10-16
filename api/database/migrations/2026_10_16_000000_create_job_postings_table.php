<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * salary: decimal(10, 2) for exact precision (never use float for money).
     * work_mode/contract_type: values mapped by the App\Enums\WorkMode and App\Enums\ContractType enums.
     * company_id: the user (with the company role) who published the job posting.
     */
    public function up(): void
    {
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->decimal('salary', 10, 2);
            $table->unsignedTinyInteger('work_mode');
            $table->unsignedTinyInteger('contract_type');
            $table->dateTime('published_at')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
