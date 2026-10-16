<?php

namespace App\Http\Resources;

use App\Models\Vaga;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Vaga
 */
class VagaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'salario' => $this->salario,
            'modalidade' => $this->modalidade?->value,
            'modalidade_label' => $this->modalidade?->label(),
            'tipo' => $this->tipo?->value,
            'tipo_label' => $this->tipo?->label(),
            'publicacao' => $this->publicacao?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
