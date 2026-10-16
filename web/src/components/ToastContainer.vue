<script setup lang="ts">
import { useNotificacoesStore } from '@/stores/notificacoes'

const notificacoes = useNotificacoesStore()
</script>

<template>
  <div
    class="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2"
    aria-live="polite"
  >
    <TransitionGroup
      enter-from-class="translate-y-2 opacity-0"
      leave-to-class="opacity-0"
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-200"
    >
      <div
        v-for="item in notificacoes.itens"
        :key="item.id"
        class="pointer-events-auto rounded-lg border-l-4 bg-white p-4 shadow-lg"
        :class="item.tipo === 'erro' ? 'border-red-500' : 'border-emerald-500'"
        role="status"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ item.titulo }}</p>
            <p v-if="item.descricao" class="mt-1 text-sm text-slate-600">{{ item.descricao }}</p>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600"
            aria-label="Fechar notificação"
            @click="notificacoes.remover(item.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
