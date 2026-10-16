<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AvatarImage from '@/components/AvatarImage.vue'
import JobCard from '@/components/JobCard.vue'
import ListPagination from '@/components/ListPagination.vue'
import { getCompany } from '@/services/companies'
import { ApiError } from '@/services/http'
import { deleteJobPosting, listJobPostings } from '@/services/jobPostings'
import { useAuthStore } from '@/stores/auth'
import { useFavoritesStore } from '@/stores/favorites'
import { useNotificationsStore } from '@/stores/notifications'
import type { Paginated } from '@/types/api'
import type { Company } from '@/types/company'
import type { JobPosting } from '@/types/jobPosting'
import { displayUrl } from '@/utils/company'

const props = defineProps<{ id: number }>()

const auth = useAuthStore()
const favorites = useFavoritesStore()
const notifications = useNotificationsStore()

const company = ref<Company | null>(null)
const error = ref<string | null>(null)

const jobs = ref<Paginated<JobPosting> | null>(null)
const page = ref(1)

const isOwner = computed(() => auth.user?.id === props.id)

const facts = computed(() =>
  [company.value?.sector, company.value?.city, company.value?.size_label].filter(Boolean),
)

const hasContacts = computed(
  () => !!(company.value?.website || company.value?.contact_email || company.value?.phone),
)

async function loadJobs() {
  try {
    jobs.value = await listJobPostings({ company: props.id, page: page.value })
  } catch {
    notifications.error('Impossibile caricare le offerte di questa azienda')
  }
}

watch(
  () => props.id,
  async (id) => {
    company.value = null
    jobs.value = null
    error.value = null
    page.value = 1

    try {
      company.value = await getCompany(id)
      await loadJobs()
    } catch (e) {
      error.value =
        e instanceof ApiError && e.isNotFound
          ? 'Questa azienda non esiste.'
          : "Impossibile caricare l'azienda."
    }
  },
  { immediate: true },
)

function changePage(newPage: number) {
  page.value = newPage
  loadJobs()
}

async function remove(job: JobPosting) {
  if (!confirm(`Eliminare l'offerta "${job.title}"?`)) return

  try {
    await deleteJobPosting(job.id)
    favorites.remove(job.id)
    notifications.success('Offerta eliminata', `"${job.title}" è stata rimossa.`)
    if (company.value) company.value.job_postings_count--
    await loadJobs()
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
    <RouterLink to="/" class="text-sm text-slate-500 hover:text-slate-900">
      ← Torna alle offerte
    </RouterLink>

    <div v-if="error" class="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <p class="text-slate-600">{{ error }}</p>
    </div>

    <template v-else-if="company">
      <header
        class="flex flex-wrap items-center gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
      >
        <AvatarImage :name="company.name" :image-url="company.logo_url" size="lg" />

        <div class="min-w-0 flex-1 space-y-2">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {{ company.name }}
          </h1>
          <p v-if="facts.length" class="text-slate-600" data-test="facts">
            {{ facts.join(' · ') }}
          </p>
        </div>

        <RouterLink
          v-if="isOwner"
          :to="{ name: 'company.profile' }"
          class="btn-secondary"
          data-test="edit-profile"
        >
          Modifica profilo
        </RouterLink>
      </header>

      <div class="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section class="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 class="font-semibold text-slate-900">Chi siamo</h2>
          <p v-if="company.description" class="whitespace-pre-line text-slate-700">
            {{ company.description }}
          </p>
          <p v-else class="text-slate-500">
            {{
              isOwner
                ? 'Non hai ancora aggiunto una descrizione. Raccontati ai candidati!'
                : 'Questa azienda non ha ancora aggiunto una descrizione.'
            }}
          </p>
        </section>

        <aside class="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 class="font-semibold text-slate-900">Contatti</h2>
          <dl v-if="hasContacts" class="space-y-3 text-sm">
            <div v-if="company.website">
              <dt class="text-slate-500">Sito web</dt>
              <dd>
                <a
                  :href="company.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-medium break-all text-indigo-600 hover:text-indigo-500"
                >
                  {{ displayUrl(company.website) }}
                </a>
              </dd>
            </div>
            <div v-if="company.contact_email">
              <dt class="text-slate-500">Email</dt>
              <dd>
                <a
                  :href="`mailto:${company.contact_email}`"
                  class="font-medium break-all text-indigo-600 hover:text-indigo-500"
                >
                  {{ company.contact_email }}
                </a>
              </dd>
            </div>
            <div v-if="company.phone">
              <dt class="text-slate-500">Telefono</dt>
              <dd>
                <a
                  :href="`tel:${company.phone.replace(/[^\d+]/g, '')}`"
                  class="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {{ company.phone }}
                </a>
              </dd>
            </div>
          </dl>
          <p v-else class="text-sm text-slate-500">Nessun contatto disponibile.</p>
        </aside>
      </div>

      <section class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-xl font-semibold text-slate-900">
            Offerte pubblicate
            <span class="font-normal text-slate-500">({{ company.job_postings_count }})</span>
          </h2>
          <RouterLink v-if="isOwner" :to="{ name: 'jobs.create' }" class="btn-primary">
            Pubblica un'offerta
          </RouterLink>
        </div>

        <template v-if="jobs">
          <div v-if="jobs.data.length" class="space-y-4">
            <JobCard v-for="job in jobs.data" :key="job.id" :job="job" @delete="remove" />
          </div>
          <div
            v-else
            class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500"
          >
            Al momento non ci sono offerte aperte.
          </div>

          <ListPagination
            :page="jobs.meta.current_page"
            :last-page="jobs.meta.last_page"
            @change="changePage"
          />
        </template>
      </section>
    </template>

    <div v-else class="space-y-4" aria-busy="true">
      <div class="h-36 animate-pulse rounded-xl bg-slate-200/70" />
      <div class="h-48 animate-pulse rounded-xl bg-slate-200/70" />
    </div>
  </div>
</template>
