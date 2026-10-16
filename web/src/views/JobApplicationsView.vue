<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ApplicantCard from '@/components/ApplicantCard.vue'
import {
  downloadApplicationCv,
  listJobApplications,
  updateApplicationStatus,
} from '@/services/applications'
import { ApiError } from '@/services/http'
import { getJobPosting } from '@/services/jobPostings'
import { useNotificationsStore } from '@/stores/notifications'
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationCounts,
  type ApplicationStatus,
} from '@/types/application'
import type { JobPosting } from '@/types/jobPosting'

const props = defineProps<{ id: number }>()

const route = useRoute()
const router = useRouter()
const notifications = useNotificationsStore()

/** The status filter lives in the URL, in Italian: ?stato=colloquio */
const STATUS_QUERY: Record<ApplicationStatus, string> = {
  in_review: 'in-valutazione',
  interview: 'colloquio',
  rejected: 'non-selezionati',
  hired: 'assunti',
}

const status = computed(() =>
  (Object.keys(STATUS_QUERY) as ApplicationStatus[]).find(
    (value) => STATUS_QUERY[value] === route.query.stato,
  ),
)

const tabs = computed(() => [
  { value: undefined, label: 'Tutte', count: counts.value?.all },
  ...APPLICATION_STATUSES.map(({ value, label }) => ({
    value,
    label,
    count: counts.value?.[value],
  })),
])

const job = ref<JobPosting | null>(null)
const applications = ref<Application[] | null>(null)
const counts = ref<ApplicationCounts | null>(null)
const error = ref<string | null>(null)
const updating = ref<number | null>(null)

const requiredSkills = computed(() => job.value?.skills.map((skill) => skill.id) ?? [])

async function load() {
  error.value = null

  try {
    const response = await listJobApplications(props.id, status.value)
    applications.value = response.data
    counts.value = response.meta.counts
  } catch (e) {
    applications.value = null
    error.value =
      e instanceof ApiError && e.isForbidden
        ? 'Puoi vedere solo i candidati delle tue offerte.'
        : 'Impossibile caricare le candidature.'
  }
}

watch(
  () => props.id,
  async (id) => {
    job.value = await getJobPosting(id).catch(() => null)
  },
  { immediate: true },
)
watch([() => props.id, status], load, { immediate: true })

function selectTab(value: ApplicationStatus | undefined) {
  router.push({ query: value ? { stato: STATUS_QUERY[value] } : {} })
}

async function changeStatus(application: Application, newStatus: ApplicationStatus) {
  updating.value = application.id

  try {
    await updateApplicationStatus(application.id, newStatus)
    const label = APPLICATION_STATUSES.find((s) => s.value === newStatus)?.label
    notifications.success('Stato aggiornato', `${application.candidate?.name}: ${label}.`)
    await load()
  } catch (e) {
    notifications.error(
      'Impossibile aggiornare lo stato',
      e instanceof Error ? e.message : undefined,
    )
  } finally {
    updating.value = null
  }
}

async function downloadCv(application: Application) {
  try {
    await downloadApplicationCv(application)
  } catch (e) {
    notifications.error('Impossibile scaricare il CV', e instanceof Error ? e.message : undefined)
  }
}
</script>

<template>
  <div class="space-y-6">
    <RouterLink
      :to="{ name: 'jobs.show', params: { id } }"
      class="text-sm text-slate-500 hover:text-slate-900"
    >
      ← Torna all'offerta
    </RouterLink>

    <section>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Candidati</h1>
      <p v-if="job" class="mt-1 text-slate-600">{{ job.title }}</p>
    </section>

    <div v-if="error" class="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <p class="text-slate-600">{{ error }}</p>
    </div>

    <template v-else-if="applications && counts">
      <nav class="flex flex-wrap gap-2" aria-label="Filtra per stato">
        <button
          v-for="tab in tabs"
          :key="tab.label"
          type="button"
          class="rounded-full px-3 py-1.5 text-sm font-medium transition"
          :class="
            status === tab.value
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          "
          :aria-pressed="status === tab.value"
          data-test="status-tab"
          @click="selectTab(tab.value)"
        >
          {{ tab.label }}
          <span class="ml-1 opacity-75">{{ tab.count }}</span>
        </button>
      </nav>

      <div v-if="applications.length" class="space-y-4">
        <ApplicantCard
          v-for="application in applications"
          :key="application.id"
          :application="
            application as Application & { candidate: NonNullable<Application['candidate']> }
          "
          :required-skills="requiredSkills"
          :busy="updating === application.id"
          @change-status="(newStatus) => changeStatus(application, newStatus)"
          @download-cv="downloadCv(application)"
        />
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500"
        data-test="empty"
      >
        {{
          counts.all === 0
            ? 'Nessuno si è ancora candidato a questa offerta.'
            : 'Nessuna candidatura con questo stato.'
        }}
      </div>
    </template>

    <div v-else class="space-y-4" aria-busy="true">
      <div v-for="n in 3" :key="n" class="h-44 animate-pulse rounded-xl bg-slate-200/70" />
    </div>
  </div>
</template>
