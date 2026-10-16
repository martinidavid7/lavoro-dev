<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import StarIcon from './StarIcon.vue'

defineEmits<{ openFavorites: [] }>()

const favorites = useFavoritesStore()
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
      <RouterLink to="/" class="text-lg font-bold tracking-tight text-slate-900">
        lavoro<span class="text-indigo-600">.dev</span>
      </RouterLink>

      <nav class="flex items-center gap-1 text-sm font-medium">
        <RouterLink
          to="/"
          class="rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900"
          exact-active-class="bg-slate-100 text-slate-900"
        >
          Offerte
        </RouterLink>
        <RouterLink
          :to="{ name: 'jobs.create' }"
          class="rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900"
          exact-active-class="bg-slate-100 text-slate-900"
        >
          Pubblica un'offerta
        </RouterLink>
        <button
          type="button"
          class="relative ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Apri le offerte preferite"
          @click="$emit('openFavorites')"
        >
          <StarIcon class="size-5" />
          <span
            v-if="favorites.count"
            class="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white"
          >
            {{ favorites.count }}
          </span>
        </button>
      </nav>
    </div>
  </header>
</template>
