<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CampoFormulario from '@/components/CampoFormulario.vue'
import { ApiError } from '@/services/http'
import { criarVaga } from '@/services/vagas'
import { useNotificacoesStore } from '@/stores/notificacoes'
import type { ErrosValidacao } from '@/types/api'
import { MODALIDADES, TIPOS_CONTRATACAO, type Modalidade, type TipoContratacao } from '@/types/vaga'

const router = useRouter()
const notificacoes = useNotificacoesStore()

const form = reactive({
  titulo: '',
  descricao: '',
  salario: null as number | null,
  modalidade: null as Modalidade | null,
  tipo: null as TipoContratacao | null,
})

const erros = ref<ErrosValidacao>({})
const enviando = ref(false)

async function publicar() {
  enviando.value = true
  erros.value = {}

  try {
    // A validação de verdade fica na API; os campos nulos voltam como erro 422.
    const vaga = await criarVaga(form as Parameters<typeof criarVaga>[0])

    notificacoes.sucesso('Vaga publicada!', `"${vaga.titulo}" já está disponível na plataforma.`)
    router.push({ name: 'vagas.detalhe', params: { id: vaga.id } })
  } catch (e) {
    if (e instanceof ApiError && e.ehValidacao) {
      erros.value = e.erros
      notificacoes.erro('Confira os campos destacados')
    } else {
      notificacoes.erro(
        'Não foi possível publicar a vaga',
        e instanceof Error ? e.message : undefined,
      )
    }
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <section>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Publicar vaga</h1>
      <p class="mt-1 text-slate-600">
        Apresente sua vaga para milhares de profissionais, de graça.
      </p>
    </section>

    <form
      class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
      novalidate
      @submit.prevent="publicar"
    >
      <CampoFormulario
        id="titulo"
        v-slot="{ invalido }"
        label="Título da vaga"
        ajuda="Por exemplo: Desenvolvedor(a) Vue.js Pleno"
        :erros="erros.titulo"
      >
        <input
          id="titulo"
          v-model.trim="form.titulo"
          type="text"
          class="campo"
          :class="{ 'campo-invalido': invalido }"
          :aria-invalid="invalido"
        />
      </CampoFormulario>

      <CampoFormulario
        id="descricao"
        v-slot="{ invalido }"
        label="Descrição"
        ajuda="Atividades, requisitos e benefícios."
        :erros="erros.descricao"
      >
        <textarea
          id="descricao"
          v-model.trim="form.descricao"
          rows="6"
          class="campo"
          :class="{ 'campo-invalido': invalido }"
          :aria-invalid="invalido"
        />
      </CampoFormulario>

      <div class="grid gap-5 sm:grid-cols-3">
        <CampoFormulario
          id="salario"
          v-slot="{ invalido }"
          label="Salário (R$)"
          :erros="erros.salario"
        >
          <input
            id="salario"
            v-model.number="form.salario"
            type="number"
            min="0"
            step="0.01"
            class="campo"
            :class="{ 'campo-invalido': invalido }"
            :aria-invalid="invalido"
          />
        </CampoFormulario>

        <CampoFormulario
          id="modalidade"
          v-slot="{ invalido }"
          label="Modalidade"
          :erros="erros.modalidade"
        >
          <select
            id="modalidade"
            v-model="form.modalidade"
            class="campo"
            :class="{ 'campo-invalido': invalido }"
            :aria-invalid="invalido"
          >
            <option :value="null" disabled>Selecione</option>
            <option v-for="opcao in MODALIDADES" :key="opcao.valor" :value="opcao.valor">
              {{ opcao.label }}
            </option>
          </select>
        </CampoFormulario>

        <CampoFormulario id="tipo" v-slot="{ invalido }" label="Contratação" :erros="erros.tipo">
          <select
            id="tipo"
            v-model="form.tipo"
            class="campo"
            :class="{ 'campo-invalido': invalido }"
            :aria-invalid="invalido"
          >
            <option :value="null" disabled>Selecione</option>
            <option v-for="opcao in TIPOS_CONTRATACAO" :key="opcao.valor" :value="opcao.valor">
              {{ opcao.label }}
            </option>
          </select>
        </CampoFormulario>
      </div>

      <div class="flex justify-end border-t border-slate-100 pt-5">
        <button type="submit" class="btn-primario" :disabled="enviando">
          {{ enviando ? 'Publicando…' : 'Publicar vaga' }}
        </button>
      </div>
    </form>
  </div>
</template>
