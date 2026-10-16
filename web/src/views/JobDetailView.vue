<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AvatarImage from '@/components/AvatarImage.vue'
import JobBadges from '@/components/JobBadges.vue'
import SkillBadges from '@/components/SkillBadges.vue'
import StarIcon from '@/components/StarIcon.vue'
import { ApiError } from '@/services/http'
import { deleteJobPosting, getJobPosting } from '@/services/jobPostings'
import { useAuthStore } from '@/stores/auth'
import { useCandidateStore } from '@/stores/candidate'
import { useFavoritesStore } from '@/stores/favorites'
import { useNotificationsStore } from '@/stores/notifications'
import type { JobPosting } from '@/types/jobPosting'
import { formatCurrency, formatDate } from '@/utils/formatters'

const props = defineProps<{ id: number }>()

const router = useRouter()
const auth = useAuthStore()
const candidate = useCandidateStore()
const favorites = useFavoritesStore()
const notifications = useNotificationsStore()

const job = ref<JobPosting | null>(null)
const error = ref<string | null>(null)

// Highlights the skills the candidate has; nothing happens for guests and companies.
candidate.ensureLoaded().catch(() => undefined)

const matchingCount = computed(
  () => job.value?.skills.filter((skill) => candidate.hasSkill(skill.id)).length ?? 0,
)

watch(
  () => props.id,
  async (id) => {
    job.value = null
    error.value = null

    try {
      job.value = await getJobPosting(id)
    } catch (e) {
      error.value =
        e instanceof ApiError && e.isNotFound
          ? 'Questa offerta non esiste o è stata rimossa.'
          : "Impossibile caricare l'offerta."
    }
  },
  { immediate: true },
)

async function remove() {
  if (!job.value || !confirm(`Eliminare l'offerta "${job.value.title}"?`)) return

  try {
    await deleteJobPosting(job.value.id)
    favorites.remove(job.value.id)
    notifications.success('Offerta eliminata')
    router.push({ name: 'home' })
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

    <article
      v-else-if="job"
      class="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
    >
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex min-w-0 gap-4">
          <AvatarImage :name="job.company.name" :image-url="job.company.logo_url" />
          <div class="min-w-0 space-y-3">
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ job.title }}</h1>
              <RouterLink
                :to="{ name: 'company.show', params: { id: job.company.id } }"
                class="mt-1 inline-block text-slate-500 hover:text-indigo-600"
              >
                {{ job.company.name }}
              </RouterLink>
            </div>
            <JobBadges :job="job" />
          </div>
        </div>

        <div class="flex gap-2">
          <button type="button" class="btn-secondary" @click="favorites.toggle(job)">
            <StarIcon
              class="size-4"
              :class="{ 'text-amber-500': favorites.isFavorite(job.id) }"
              :filled="favorites.isFavorite(job.id)"
            />
            {{ favorites.isFavorite(job.id) ? 'Nei preferiti' : 'Aggiungi ai preferiti' }}
          </button>
          <button v-if="auth.canManage(job)" type="button" class="btn-danger" @click="remove">
            Elimina
          </button>
        </div>
      </header>

      <dl class="grid gap-4 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt class="text-slate-500">RAL</dt>
          <dd class="font-semibold text-slate-900">{{ formatCurrency(job.salary) }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">Contratto</dt>
          <dd class="font-semibold text-slate-900">{{ job.contract_type_label }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">Pubblicata il</dt>
          <dd class="font-semibold text-slate-900">{{ formatDate(job.published_at) }}</dd>
        </div>
      </dl>

      <section v-if="job.skills.length">
        <h2 class="mb-2 font-semibold text-slate-900">Competenze richieste</h2>
        <SkillBadges :skills="job.skills" :matching="candidate.skillIds" />
        <p v-if="candidate.profile" class="mt-2 text-sm text-slate-600" data-test="skills-match">
          <template v-if="matchingCount">
            Hai {{ matchingCount }} {{ matchingCount === 1 ? 'competenza' : 'competenze' }} su
            {{ job.skills.length }} richieste.
          </template>
          <template v-else>
            Nessuna delle competenze richieste è nel tuo profilo.
            <RouterLink
              :to="{ name: 'candidate.profile' }"
              class="text-indigo-600 hover:text-indigo-500"
            >
              Aggiorna le tue competenze
            </RouterLink>
          </template>
        </p>
      </section>

      <section>
        <h2 class="mb-2 font-semibold text-slate-900">Descrizione</h2>
        <p class="whitespace-pre-line text-slate-700">{{ job.description }}</p>
      </section>
    </article>

    <div v-else class="h-80 animate-pulse rounded-xl bg-slate-200/70" aria-busy="true" />
  </div>
</template>
