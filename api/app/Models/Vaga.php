<?php

namespace App\Models;

use App\Enums\Modalidade;
use App\Enums\TipoContratacao;
use Database\Factories\VagaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['titulo', 'descricao', 'salario', 'publicacao', 'modalidade', 'tipo'])]
class Vaga extends Model
{
    /** @use HasFactory<VagaFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'publicacao' => 'datetime',
            'salario' => 'decimal:2',
            'modalidade' => Modalidade::class,
            'tipo' => TipoContratacao::class,
        ];
    }

    /**
     * Aplica os filtros da listagem (titulo, modalidade, tipo).
     *
     * @param  Builder<self>  $query
     * @param  array<string, mixed>  $filtros
     */
    public function scopeFiltrar(Builder $query, array $filtros): void
    {
        $query
            ->when($filtros['titulo'] ?? null, fn (Builder $q, string $titulo) => $q->where('titulo', 'like', "%{$titulo}%"))
            ->when($filtros['modalidade'] ?? null, fn (Builder $q, $modalidade) => $q->where('modalidade', $modalidade))
            ->when($filtros['tipo'] ?? null, fn (Builder $q, $tipo) => $q->where('tipo', $tipo));
    }
}
