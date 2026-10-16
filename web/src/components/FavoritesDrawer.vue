<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'

const open = defineModel<boolean>('open', { required: true })

const favorites = useFavoritesStore()

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => document.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => document.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <Transition
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
  >
    <div v-if="open" class="fixed inset-0 z-40 bg-slate-900/30" @click="open = false" />
  </Transition>

  <Transition
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
    enter-active-class="transition-transform duration-200"
    leave-active-class="transition-transform duration-200"
  >
    <aside
      v-if="open"
      class="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="favorites-title"
    >
      <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 id="favorites-title" class="font-semibold text-slate-900">Offerte preferite</h2>
        <button
          type="button"
          class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          aria-label="Chiudi"
          @click="open = false"
        >
          ✕
        </button>
      </header>

      <p v-if="!favorites.count" class="px-5 py-10 text-center text-sm text-slate-500">
        Non hai ancora aggiunto offerte ai preferiti.
      </p>

      <ul v-else class="flex-1 divide-y divide-slate-100 overflow-y-auto">
        <li
          v-for="job in favorites.items"
          :key="job.id"
          class="flex items-center justify-between gap-3 px-5 py-3"
        >
          <RouterLink
            :to="{ name: 'jobs.show', params: { id: job.id } }"
            class="text-sm font-medium text-slate-700 hover:text-indigo-600"
            @click="open = false"
          >
            {{ job.title }}
          </RouterLink>
          <button
            type="button"
            class="text-xs text-slate-400 hover:text-red-600"
            @click="favorites.remove(job.id)"
          >
            Rimuovi
          </button>
        </li>
      </ul>
    </aside>
  </Transition>
</template>
