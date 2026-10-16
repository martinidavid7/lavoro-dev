<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCandidateStore } from '@/stores/candidate'
import { useFavoritesStore } from '@/stores/favorites'
import type { JobPosting } from '@/types/jobPosting'
import { formatCurrency, formatDate } from '@/utils/formatters'
import AvatarImage from './AvatarImage.vue'
import JobBadges from './JobBadges.vue'
import SkillBadges from './SkillBadges.vue'
import StarIcon from './StarIcon.vue'

defineProps<{ job: JobPosting }>()
defineEmits<{ delete: [job: JobPosting] }>()

const auth = useAuthStore()
const candidate = useCandidateStore()
const favorites = useFavoritesStore()
</script>

<template>
  <article
    class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 gap-4">
        <AvatarImage
          :name="job.company.name"
          :image-url="job.company.logo_url"
          class="hidden sm:grid"
        />

        <div class="min-w-0 space-y-2">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">
              <RouterLink
                :to="{ name: 'jobs.show', params: { id: job.id } }"
                class="hover:text-indigo-600"
              >
                {{ job.title }}
              </RouterLink>
            </h3>
            <RouterLink
              :to="{ name: 'company.show', params: { id: job.company.id } }"
              class="text-sm text-slate-500 hover:text-indigo-600"
              data-test="company"
            >
              {{ job.company.name }}
            </RouterLink>
          </div>
          <JobBadges :job="job" />
        </div>
      </div>

      <button
        type="button"
        class="rounded-lg p-2 transition"
        :class="
          favorites.isFavorite(job.id)
            ? 'text-amber-500 hover:bg-amber-50'
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
        "
        :aria-pressed="favorites.isFavorite(job.id)"
        :aria-label="
          favorites.isFavorite(job.id) ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'
        "
        data-test="favorite"
        @click="favorites.toggle(job)"
      >
        <StarIcon class="size-5" :filled="favorites.isFavorite(job.id)" />
      </button>
    </div>

    <p class="mt-3 line-clamp-3 text-sm text-slate-600">{{ job.description }}</p>

    <SkillBadges class="mt-3" :skills="job.skills" :matching="candidate.skillIds" :limit="6" />

    <footer
      class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm"
    >
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
        <span>
          <span class="font-semibold text-slate-900" data-test="salary">
            {{ formatCurrency(job.salary) }}
          </span>
          RAL
        </span>
        <span>Pubblicata il {{ formatDate(job.published_at) }}</span>
      </div>

      <button
        v-if="auth.canManage(job)"
        type="button"
        class="btn-danger px-3 py-1.5"
        @click="$emit('delete', job)"
      >
        Elimina
      </button>
    </footer>
  </article>
</template>
