<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge.vue'
import AvatarImage from '@/components/AvatarImage.vue'
import { useApplicationsStore } from '@/stores/applications'
import { useNotificationsStore } from '@/stores/notifications'
import { APPLICATION_STATUSES, type Application } from '@/types/application'
import { formatDate } from '@/utils/formatters'

const applications = useApplicationsStore()
const notifications = useNotificationsStore()

const loadError = ref(false)

applications.ensureLoaded().catch(() => (loadError.value = true))

/** "2 in valutazione · 1 colloquio": a summary of where the applications stand. */
const summary = computed(() =>
  APPLICATION_STATUSES.map(({ value, label }) => ({
    label,
    count: applications.items.filter((application) => application.status === value).length,
  })).filter(({ count }) => count > 0),
)

async function withdraw(application: Application) {
  if (!confirm(`Ritirare la candidatura per "${application.job_posting?.title}"?`)) return

  try {
    await applications.withdraw(application.id)
    notifications.success('Candidatura ritirata')
  } catch (e) {
    notifications.error(
      'Impossibile ritirare la candidatura',
      e instanceof Error ? e.message : undefined,
    )
  }
}
</script>

<template>
  <div class="space-y-6">
    <section>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Le mie candidature</h1>
      <p class="mt-1 text-slate-600">Segui lo stato delle offerte a cui ti sei candidato.</p>
    </section>

    <div v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p class="font-medium text-red-700">Impossibile caricare le candidature.</p>
    </div>

    <template v-else-if="applications.loaded">
      <p v-if="summary.length" class="text-sm text-slate-500" data-test="summary">
        {{ summary.map(({ label, count }) => `${count} ${label.toLowerCase()}`).join(' · ') }}
      </p>

      <ul v-if="applications.items.length" class="space-y-3">
        <li
          v-for="application in applications.items"
          :key="application.id"
          class="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
          data-test="application"
        >
          <AvatarImage
            v-if="application.job_posting"
            :name="application.job_posting.company.name"
            :image-url="application.job_posting.company.logo_url"
            size="sm"
          />

          <div class="min-w-0 flex-1">
            <RouterLink
              v-if="application.job_posting"
              :to="{ name: 'jobs.show', params: { id: application.job_posting.id } }"
              class="font-semibold text-slate-900 hover:text-indigo-600"
            >
              {{ application.job_posting.title }}
            </RouterLink>
            <p class="text-sm text-slate-500">
              {{ application.job_posting?.company.name }} · inviata il
              {{ formatDate(application.created_at) }}
            </p>
          </div>

          <ApplicationStatusBadge :status="application.status" />

          <button
            v-if="application.status !== 'hired'"
            type="button"
            class="btn-danger px-3 py-1.5"
            @click="withdraw(application)"
          >
            Ritira
          </button>
        </li>
      </ul>

      <div
        v-else
        class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500"
      >
        <p>Non ti sei ancora candidato a nessuna offerta.</p>
        <RouterLink :to="{ name: 'home' }" class="btn-primary mt-4">Cerca un'offerta</RouterLink>
      </div>
    </template>

    <div v-else class="space-y-3" aria-busy="true">
      <div v-for="n in 3" :key="n" class="h-20 animate-pulse rounded-xl bg-slate-200/70" />
    </div>
  </div>
</template>
