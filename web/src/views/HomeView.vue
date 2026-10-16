<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import JobCard from '@/components/JobCard.vue'
import JobComparisonBar from '@/components/JobComparisonBar.vue'
import JobFilters from '@/components/JobFilters.vue'
import ListPagination from '@/components/ListPagination.vue'
import { deleteJobPosting, listJobPostings } from '@/services/jobPostings'
import { useAuthStore } from '@/stores/auth'
import { useCandidateStore } from '@/stores/candidate'
import { useComparisonStore } from '@/stores/comparison'
import { useNotificationsStore } from '@/stores/notifications'
import { useSkillsStore } from '@/stores/skills'
import type { Paginated } from '@/types/api'
import type { JobPosting, JobPostingFilters } from '@/types/jobPosting'
import { filtersFromQuery, filtersToQuery } from '@/utils/filters'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const candidate = useCandidateStore()
const notifications = useNotificationsStore()
const skills = useSkillsStore()

const result = ref<Paginated<JobPosting> | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const comparison = useComparisonStore()

// Filters live in the URL, so a search can be shared and the back button works.
const filters = computed(() => filtersFromQuery(route.query))

/** "Le mie offerte": the logged in company looking at its own job postings. */
const isOwnListing = computed(
  () => filters.value.company !== undefined && filters.value.company === auth.user?.id,
)

const companyName = computed(() =>
  isOwnListing.value ? auth.user?.name : result.value?.data[0]?.company.name,
)

// The candidate's skills power the "my skills" filter; the catalog names the active ones.
candidate.ensureLoaded().catch(() => undefined)
skills.ensureLoaded().catch(() => undefined)

const activeSkills = computed(() => skills.byIds(filters.value.skills ?? []))

const isMySkillsFilter = computed(
  () =>
    candidate.skillIds.length > 0 &&
    candidate.skillIds.length === filters.value.skills?.length &&
    candidate.skillIds.every((id) => filters.value.skills?.includes(id)),
)

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

// The search form does not hold the company and skills filters, so they are kept from the URL.
function search(newFilters: JobPostingFilters) {
  const { company, skills } = filters.value

  router.push({ query: filtersToQuery({ ...newFilters, company, skills, page: 1 }) })
}

function applyFilters(changes: JobPostingFilters) {
  router.push({ query: filtersToQuery({ ...filters.value, ...changes, page: 1 }) })
}

function clearCompany() {
  applyFilters({ company: undefined })
}

function removeSkill(id: number) {
  const remaining = (filters.value.skills ?? []).filter((skillId) => skillId !== id)

  applyFilters({ skills: remaining.length ? remaining : undefined })
}

function changePage(page: number) {
  router.push({ query: filtersToQuery({ ...filters.value, page }) })
}

async function remove(job: JobPosting) {
  if (!confirm(`Eliminare l'offerta "${job.title}"?`)) return

  try {
    await deleteJobPosting(job.id)
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
    <section v-if="isOwnListing" class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Le mie offerte</h1>
        <p class="mt-1 text-slate-600">Le offerte pubblicate da {{ auth.user?.name }}.</p>
      </div>
      <RouterLink :to="{ name: 'jobs.create' }" class="btn-primary">Pubblica un'offerta</RouterLink>
    </section>

    <section v-else>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Trova il tuo prossimo lavoro
      </h1>
      <p class="mt-1 text-slate-600">Offerte di lavoro nel settore tech, in sede e da remoto.</p>
    </section>

    <JobFilters :filters="filters" @search="search" />

    <div
      v-if="activeSkills.length"
      class="flex flex-wrap items-center gap-2 text-sm text-slate-600"
      data-test="skills-filter"
    >
      {{ isMySkillsFilter ? 'Le mie competenze:' : 'Competenze:' }}
      <span
        v-for="skill in activeSkills"
        :key="skill.id"
        class="inline-flex items-center gap-1 rounded-full bg-emerald-50 py-1 pr-1 pl-3 font-medium text-emerald-700"
      >
        {{ skill.name }}
        <button
          type="button"
          class="grid size-5 place-items-center rounded-full hover:bg-emerald-100"
          :aria-label="`Rimuovi il filtro ${skill.name}`"
          @click="removeSkill(skill.id)"
        >
          ×
        </button>
      </span>
      <button
        type="button"
        class="text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
        @click="applyFilters({ skills: undefined })"
      >
        Rimuovi filtro
      </button>
    </div>

    <div
      v-else-if="auth.user?.role === 'candidate' && candidate.profile"
      class="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm"
      data-test="my-skills-cta"
    >
      <template v-if="candidate.skillIds.length">
        <span class="text-emerald-800">Cerchi offerte adatte a te?</span>
        <button
          type="button"
          class="font-medium text-emerald-700 underline-offset-2 hover:underline"
          @click="applyFilters({ skills: candidate.skillIds })"
        >
          Mostra le offerte per le mie competenze
        </button>
      </template>
      <template v-else>
        <span class="text-emerald-800">
          Aggiungi le tue competenze per trovare le offerte più adatte a te.
        </span>
        <RouterLink
          :to="{ name: 'candidate.profile' }"
          class="font-medium text-emerald-700 underline-offset-2 hover:underline"
        >
          Completa il profilo
        </RouterLink>
      </template>
    </div>

    <div
      v-if="filters.company && !isOwnListing"
      class="flex items-center gap-2 text-sm text-slate-600"
      data-test="company-filter"
    >
      Offerte di
      <span
        class="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pr-1 pl-3 font-medium text-indigo-700"
      >
        {{ companyName ?? 'questa azienda' }}
        <button
          type="button"
          class="grid size-5 place-items-center rounded-full hover:bg-indigo-100"
          aria-label="Mostra le offerte di tutte le aziende"
          @click="clearCompany"
        >
          ×
        </button>
      </span>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p class="font-medium text-red-700">{{ error }}</p>
      <button type="button" class="btn-secondary mt-4" @click="load">Riprova</button>
    </div>

    <template v-else-if="result">
      <p class="text-sm text-slate-500" aria-live="polite">
        {{ result.meta.total }}
        {{ result.meta.total === 1 ? 'offerta trovata' : 'offerte trovate'
        }}<template v-if="activeSkills.length">, dalla più compatibile</template>
      </p>

      <div
        v-if="result.data.length"
        class="space-y-4 transition-opacity"
        :class="{ 'opacity-50': loading }"
      >
        <JobCard
          v-for="job in result.data"
          :key="job.id"
          :job="job"
          comparison-enabled
          :comparison-selected="comparison.isSelected(job.id)"
          :comparison-disabled="comparison.isFull"
          @compare="comparison.toggle"
          @delete="remove"
        />
      </div>

      <div
        v-else-if="isOwnListing && !filters.title && !filters.work_mode && !filters.contract_type"
        class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500"
      >
        <p>Non hai ancora pubblicato offerte.</p>
        <RouterLink :to="{ name: 'jobs.create' }" class="btn-primary mt-4">
          Pubblica la prima offerta
        </RouterLink>
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
    <JobComparisonBar
      :jobs="comparison.jobs"
      @remove="comparison.remove"
      @clear="comparison.clear"
    />
  </div>
</template>
