<?php

use App\Enums\Modalidade;
use App\Enums\TipoContratacao;
use App\Models\Vaga;

describe('listagem', function () {
    it('lista as vagas paginadas, mais recentes primeiro', function () {
        $antiga = Vaga::factory()->create(['publicacao' => now()->subDays(5)]);
        $recente = Vaga::factory()->create(['publicacao' => now()]);

        $this->getJson('/api/vagas')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $recente->id)
            ->assertJsonPath('data.1.id', $antiga->id)
            ->assertJsonStructure(['data', 'links', 'meta' => ['current_page', 'last_page', 'total']]);
    });

    it('filtra por titulo', function () {
        Vaga::factory()->create(['titulo' => 'Desenvolvedor Vue Pleno']);
        Vaga::factory()->create(['titulo' => 'Analista Financeiro']);

        $this->getJson('/api/vagas?titulo=vue')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Desenvolvedor Vue Pleno');
    });

    it('filtra por modalidade e tipo', function () {
        Vaga::factory()->create(['modalidade' => Modalidade::HomeOffice, 'tipo' => TipoContratacao::PJ]);
        Vaga::factory()->create(['modalidade' => Modalidade::HomeOffice, 'tipo' => TipoContratacao::CLT]);
        Vaga::factory()->create(['modalidade' => Modalidade::Presencial, 'tipo' => TipoContratacao::PJ]);

        $this->getJson('/api/vagas?modalidade=1&tipo=2')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('rejeita filtros invalidos', function () {
        $this->getJson('/api/vagas?modalidade=99')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('modalidade');
    });
});

describe('cadastro', function () {
    it('cria uma vaga com data de publicacao definida pelo servidor', function () {
        $this->freezeSecond();

        $this->postJson('/api/vagas', [
            'titulo' => 'Desenvolvedor Laravel',
            'descricao' => 'Vaga para trabalhar com APIs.',
            'salario' => 8500.50,
            'modalidade' => Modalidade::HomeOffice->value,
            'tipo' => TipoContratacao::PJ->value,
        ])
            ->assertCreated()
            ->assertJsonPath('data.titulo', 'Desenvolvedor Laravel')
            ->assertJsonPath('data.modalidade_label', 'Home Office')
            ->assertJsonPath('data.tipo_label', 'PJ');

        expect(Vaga::sole())
            ->salario->toBe('8500.50')
            ->publicacao->toEqual(now());
    });

    it('valida os campos obrigatorios', function () {
        $this->postJson('/api/vagas', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['titulo', 'descricao', 'salario', 'modalidade', 'tipo']);
    });

    it('rejeita salario negativo ou com mais de duas casas decimais', function (mixed $salario) {
        $this->postJson('/api/vagas', Vaga::factory()->raw(['salario' => $salario]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('salario');
    })->with([-1, 10.555]);
});

describe('detalhe, edicao e exclusao', function () {
    it('exibe uma vaga', function () {
        $vaga = Vaga::factory()->create();

        $this->getJson("/api/vagas/{$vaga->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $vaga->id);
    });

    it('retorna 404 para vaga inexistente', function () {
        $this->getJson('/api/vagas/999')->assertNotFound();
    });

    it('atualiza parcialmente uma vaga', function () {
        $vaga = Vaga::factory()->create(['titulo' => 'Antigo']);

        $this->patchJson("/api/vagas/{$vaga->id}", ['titulo' => 'Novo titulo'])
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Novo titulo')
            ->assertJsonPath('data.descricao', $vaga->descricao);
    });

    it('exclui uma vaga', function () {
        $vaga = Vaga::factory()->create();

        $this->deleteJson("/api/vagas/{$vaga->id}")->assertNoContent();

        $this->assertModelMissing($vaga);
    });
});
