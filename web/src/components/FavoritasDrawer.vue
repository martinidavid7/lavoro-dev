<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useFavoritasStore } from '@/stores/favoritas'

const aberto = defineModel<boolean>('aberto', { required: true })

const favoritas = useFavoritasStore()

function fecharComEsc(evento: KeyboardEvent) {
  if (evento.key === 'Escape') aberto.value = false
}

onMounted(() => document.addEventListener('keydown', fecharComEsc))
onBeforeUnmount(() => document.removeEventListener('keydown', fecharComEsc))
</script>

<template>
  <Transition
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
  >
    <div v-if="aberto" class="fixed inset-0 z-40 bg-slate-900/30" @click="aberto = false" />
  </Transition>

  <Transition
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
    enter-active-class="transition-transform duration-200"
    leave-active-class="transition-transform duration-200"
  >
    <aside
      v-if="aberto"
      class="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-favoritas"
    >
      <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 id="titulo-favoritas" class="font-semibold text-slate-900">Vagas favoritas</h2>
        <button
          type="button"
          class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          aria-label="Fechar"
          @click="aberto = false"
        >
          ✕
        </button>
      </header>

      <p v-if="!favoritas.total" class="px-5 py-10 text-center text-sm text-slate-500">
        Você ainda não favoritou nenhuma vaga.
      </p>

      <ul v-else class="flex-1 divide-y divide-slate-100 overflow-y-auto">
        <li
          v-for="vaga in favoritas.vagas"
          :key="vaga.id"
          class="flex items-center justify-between gap-3 px-5 py-3"
        >
          <RouterLink
            :to="{ name: 'vagas.detalhe', params: { id: vaga.id } }"
            class="text-sm font-medium text-slate-700 hover:text-indigo-600"
            @click="aberto = false"
          >
            {{ vaga.titulo }}
          </RouterLink>
          <button
            type="button"
            class="text-xs text-slate-400 hover:text-red-600"
            @click="favoritas.remover(vaga.id)"
          >
            Remover
          </button>
        </li>
      </ul>
    </aside>
  </Transition>
</template>
