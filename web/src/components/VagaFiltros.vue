<script setup lang="ts">
import { reactive, watch } from 'vue'
import { MODALIDADES, TIPOS_CONTRATACAO, type FiltrosVaga } from '@/types/vaga'

const props = defineProps<{ filtros: FiltrosVaga }>()
const emit = defineEmits<{ buscar: [filtros: FiltrosVaga] }>()

const form = reactive<FiltrosVaga>({})

// Mantém o formulário sincronizado com a URL (ex.: botão voltar do navegador).
watch(
  () => props.filtros,
  ({ titulo, modalidade, tipo }) => Object.assign(form, { titulo, modalidade, tipo }),
  { immediate: true },
)

function buscar() {
  emit('buscar', { ...form, titulo: form.titulo?.trim() || undefined })
}

function limpar() {
  Object.assign(form, { titulo: undefined, modalidade: undefined, tipo: undefined })
  buscar()
}
</script>

<template>
  <form
    class="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-[1fr_auto_auto_auto]"
    role="search"
    @submit.prevent="buscar"
  >
    <label class="sr-only" for="filtro-titulo">Título da vaga</label>
    <input
      id="filtro-titulo"
      v-model="form.titulo"
      type="search"
      class="campo"
      placeholder="Busque por cargo ou tecnologia: PHP, Vue, Analista…"
    />

    <label class="sr-only" for="filtro-modalidade">Modalidade</label>
    <select id="filtro-modalidade" v-model="form.modalidade" class="campo">
      <option :value="undefined">Todas as modalidades</option>
      <option v-for="opcao in MODALIDADES" :key="opcao.valor" :value="opcao.valor">
        {{ opcao.label }}
      </option>
    </select>

    <label class="sr-only" for="filtro-tipo">Tipo de contratação</label>
    <select id="filtro-tipo" v-model="form.tipo" class="campo">
      <option :value="undefined">Todos os tipos</option>
      <option v-for="opcao in TIPOS_CONTRATACAO" :key="opcao.valor" :value="opcao.valor">
        {{ opcao.label }}
      </option>
    </select>

    <div class="flex gap-2">
      <button type="submit" class="btn-primario flex-1">Buscar</button>
      <button type="button" class="btn-secundario" @click="limpar">Limpar</button>
    </div>
  </form>
</template>
