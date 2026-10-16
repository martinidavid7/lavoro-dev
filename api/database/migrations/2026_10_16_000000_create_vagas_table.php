<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * salario: decimal(10, 2) — precisão exata (nunca use float para dinheiro).
     * modalidade/tipo: valores mapeados pelos enums App\Enums\Modalidade e App\Enums\TipoContratacao.
     */
    public function up(): void
    {
        Schema::create('vagas', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descricao');
            $table->decimal('salario', 10, 2);
            $table->unsignedTinyInteger('modalidade');
            $table->unsignedTinyInteger('tipo');
            $table->dateTime('publicacao')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vagas');
    }
};
