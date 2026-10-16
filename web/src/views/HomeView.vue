<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JobCard from '@/components/JobCard.vue'
import JobFilters from '@/components/JobFilters.vue'
import ListPagination from '@/components/ListPagination.vue'
import { deleteJobPosting, listJobPostings } from '@/services/jobPostings'
import { useFavoritesStore } from '@/stores/favorites'
import { useNotificationsStore } from '@/stores/notifications'
import type { Paginated } from '@/types/api'
import type { JobPosting, JobPostingFilters } from '@/types/jobPosting'
import { filtersFromQuery, filtersToQuery } from '@/utils/filters'

const route = useRoute()
const router = useRouter()
const favorites = useFavoritesStore()
const notifications = useNotificationsStore()

const result = ref<Paginated<JobPosting> | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Filters live in the URL, so a search can be shared and the back button works.
const filters = computed(() => filtersFromQuery(route.query))

async function load() {
  loading.value = true
  error.value = null

  try {
    result.value = await listJobPostings(filters.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Errore nel caricamento delle offerte.'
  } finally {
    loading.value = false
  }
}

watch(filters, load, { immediate: true })

function search(newFilters: JobPostingFilters) {
  router.push({ query: filtersToQuery({ ...newFilters, page: 1 }) })
}

function changePage(page: number) {
  router.push({ query: filtersToQuery({ ...filters.value, page }) })
}

async function remove(job: JobPosting) {
  if (!confirm(`Eliminare l'offerta "${job.title}"?`)) return

  try {
    await deleteJobPosting(job.id)
    favorites.remove(job.id)
    notifications.success('Offerta eliminata', `"${job.title}" è stata rimossa.`)
    await load()
  } catch (e) {
    notifications.error(
      "Impossibile eliminare l'offerta",
      e instanceof Error ? e.message : undefined,
    )
  }
}
</script>

<template>
  <div class="space-y-6">
    <section>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Trova il tuo prossimo lavoro
      </h1>
      <p class="mt-1 text-slate-600">Offerte di lavoro nel settore tech, in sede e da remoto.</p>
    </section>

    <JobFilters :filters="filters" @search="search" />

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p class="font-medium text-red-700">{{ error }}</p>
      <button type="button" class="btn-secondary mt-4" @click="load">Riprova</button>
    </div>

    <template v-else-if="result">
      <p class="text-sm text-slate-500" aria-live="polite">
        {{ result.meta.total }}
        {{ result.meta.total === 1 ? 'offerta trovata' : 'offerte trovate' }}
      </p>

      <div
        v-if="result.data.length"
        class="space-y-4 transition-opacity"
        :class="{ 'opacity-50': loading }"
      >
        <JobCard v-for="job in result.data" :key="job.id" :job="job" @delete="remove" />
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500"
      >
        Nessuna offerta corrisponde ai filtri selezionati.
      </div>

      <ListPagination
        :page="result.meta.current_page"
        :last-page="result.meta.last_page"
        @change="changePage"
      />
    </template>

    <div v-else class="space-y-4" aria-busy="true">
      <div v-for="n in 3" :key="n" class="h-40 animate-pulse rounded-xl bg-slate-200/70" />
    </div>
  </div>
</template>
