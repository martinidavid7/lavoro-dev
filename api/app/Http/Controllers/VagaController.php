<?php

namespace App\Http\Controllers;

use App\Enums\Modalidade;
use App\Enums\TipoContratacao;
use App\Http\Requests\StoreVagaRequest;
use App\Http\Requests\UpdateVagaRequest;
use App\Http\Resources\VagaResource;
use App\Models\Vaga;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class VagaController extends Controller
{
    /**
     * GET /api/vagas — lista paginada, mais recentes primeiro.
     *
     * Filtros opcionais via query string: ?titulo=dev&modalidade=1&tipo=2
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filtros = $request->validate([
            'titulo' => ['nullable', 'string', 'max:100'],
            'modalidade' => ['nullable', Rule::enum(Modalidade::class)],
            'tipo' => ['nullable', Rule::enum(TipoContratacao::class)],
        ]);

        $vagas = Vaga::query()
            ->filtrar($filtros)
            ->orderByDesc('publicacao')
            ->paginate(10)
            ->withQueryString();

        return VagaResource::collection($vagas);
    }

    /**
     * POST /api/vagas
     */
    public function store(StoreVagaRequest $request): VagaResource
    {
        $vaga = Vaga::create([
            ...$request->validated(),
            'publicacao' => now(),
        ]);

        return new VagaResource($vaga);
    }

    /**
     * GET /api/vagas/{vaga}
     */
    public function show(Vaga $vaga): VagaResource
    {
        return new VagaResource($vaga);
    }

    /**
     * PUT/PATCH /api/vagas/{vaga}
     */
    public function update(UpdateVagaRequest $request, Vaga $vaga): VagaResource
    {
        $vaga->update($request->validated());

        return new VagaResource($vaga);
    }

    /**
     * DELETE /api/vagas/{vaga}
     */
    public function destroy(Vaga $vaga): Response
    {
        $vaga->delete();

        return response()->noContent();
    }
}
