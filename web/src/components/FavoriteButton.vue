<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFavoritesStore, type FavoriteJob } from '@/stores/favorites'
import StarIcon from './StarIcon.vue'

/**
 * The star on a job posting. Candidates save it to their favorites; guests are sent
 * to the login page; companies don't see it.
 */
defineProps<{ job: FavoriteJob; withLabel?: boolean }>()

const route = useRoute()
const auth = useAuthStore()
const favorites = useFavoritesStore()
</script>

<template>
  <button
    v-if="favorites.enabled"
    type="button"
    class="rounded-lg transition"
    :class="[
      withLabel ? 'btn-secondary' : 'p-2',
      favorites.isFavorite(job.id)
        ? 'text-amber-500 hover:bg-amber-50'
        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600',
    ]"
    :aria-pressed="favorites.isFavorite(job.id)"
    :aria-label="favorites.isFavorite(job.id) ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'"
    data-test="favorite"
    @click="favorites.toggle(job)"
  >
    <StarIcon :class="withLabel ? 'size-4' : 'size-5'" :filled="favorites.isFavorite(job.id)" />
    <span v-if="withLabel" class="text-slate-700">
      {{ favorites.isFavorite(job.id) ? 'Nei preferiti' : 'Aggiungi ai preferiti' }}
    </span>
  </button>

  <RouterLink
    v-else-if="!auth.user"
    :to="{ name: 'login', query: { redirect: route?.fullPath } }"
    class="rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
    :class="withLabel ? 'btn-secondary' : 'p-2'"
    aria-label="Accedi per salvare nei preferiti"
    title="Accedi per salvare nei preferiti"
    data-test="favorite-login"
  >
    <StarIcon :class="withLabel ? 'size-4' : 'size-5'" />
    <span v-if="withLabel" class="text-slate-700">Aggiungi ai preferiti</span>
  </RouterLink>
</template>
