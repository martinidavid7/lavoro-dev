<script setup lang="ts">
import { computed, useId } from 'vue'
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from '@/types/application'
import { formatDate } from '@/utils/formatters'
import ApplicationStatusBadge from './ApplicationStatusBadge.vue'
import AvatarImage from './AvatarImage.vue'
import SkillBadges from './SkillBadges.vue'

/** One applicant in the company's panel. */
const props = defineProps<{
  application: Application & { candidate: NonNullable<Application['candidate']> }
  /** Skills required by the job posting, highlighted among the candidate's ones. */
  requiredSkills: number[]
  busy?: boolean
}>()

const emit = defineEmits<{ changeStatus: [status: ApplicationStatus]; downloadCv: [] }>()

const statusId = useId()
const candidate = computed(() => props.application.candidate)

const details = computed(() =>
  [
    candidate.value.headline,
    candidate.value.city,
    candidate.value.experience_years !== null
      ? `${candidate.value.experience_years} ${candidate.value.experience_years === 1 ? 'anno' : 'anni'} di esperienza`
      : null,
  ].filter(Boolean),
)

const matchingCount = computed(
  () => candidate.value.skills.filter((skill) => props.requiredSkills.includes(skill.id)).length,
)

const links = computed(() =>
  [
    { label: 'LinkedIn', url: candidate.value.linkedin_url },
    { label: 'GitHub', url: candidate.value.github_url },
    { label: 'Portfolio', url: candidate.value.portfolio_url },
  ].filter((link): link is { label: string; url: string } => !!link.url),
)

function onStatusChange(event: Event) {
  emit('changeStatus', (event.target as HTMLSelectElement).value as ApplicationStatus)
}
</script>

<template>
  <article class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex min-w-0 gap-4">
        <AvatarImage :name="candidate.name" :image-url="candidate.photo_url" round />
        <div class="min-w-0">
          <h3 class="font-semibold text-slate-900">{{ candidate.name }}</h3>
          <p v-if="details.length" class="text-sm text-slate-600" data-test="details">
            {{ details.join(' · ') }}
          </p>
          <p class="text-xs text-slate-500">
            Candidatura del {{ formatDate(application.created_at) }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <ApplicationStatusBadge :status="application.status" />
        <label :for="statusId" class="sr-only"
          >Stato della candidatura di {{ candidate.name }}</label
        >
        <select
          :id="statusId"
          :value="application.status"
          class="field w-auto py-1.5"
          :disabled="busy"
          data-test="status-select"
          @change="onStatusChange"
        >
          <option v-for="status in APPLICATION_STATUSES" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </div>
    </header>

    <div v-if="candidate.skills.length" class="space-y-1.5">
      <SkillBadges :skills="candidate.skills" :matching="requiredSkills" :limit="10" />
      <p v-if="requiredSkills.length" class="text-xs text-slate-500" data-test="skills-match">
        {{ matchingCount }} su {{ requiredSkills.length }} competenze richieste
      </p>
    </div>

    <details v-if="application.cover_letter" class="group text-sm">
      <summary class="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500">
        Lettera di presentazione
      </summary>
      <p class="mt-2 whitespace-pre-line text-slate-700">{{ application.cover_letter }}</p>
    </details>

    <footer
      class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm"
    >
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <a :href="`mailto:${candidate.email}`" class="text-indigo-600 hover:text-indigo-500">
          {{ candidate.email }}
        </a>
        <a
          v-if="candidate.phone"
          :href="`tel:${candidate.phone.replace(/[^\d+]/g, '')}`"
          class="text-indigo-600 hover:text-indigo-500"
        >
          {{ candidate.phone }}
        </a>
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-indigo-600 hover:text-indigo-500"
        >
          {{ link.label }}
        </a>
      </div>

      <button
        type="button"
        class="btn-secondary px-3 py-1.5"
        data-test="download-cv"
        @click="emit('downloadCv')"
      >
        Scarica CV
      </button>
    </footer>
  </article>
</template>
