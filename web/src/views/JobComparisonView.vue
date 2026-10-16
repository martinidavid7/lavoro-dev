<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import JobComparisonTable from '@/components/JobComparisonTable.vue'
import { getJobPosting } from '@/services/jobPostings'
import { useCandidateStore } from '@/stores/candidate'
import { useComparisonStore } from '@/stores/comparison'
import type { JobPosting } from '@/types/jobPosting'

const route = useRoute()
const router = useRouter()
const candidate = useCandidateStore()
const comparison = useComparisonStore()
const jobs = ref<JobPosting[]>([])
const loading = ref(false)
const failed = ref<number[]>([])
const ids = computed(() =>
  [
    ...new Set(
      String(route.query.offerte ?? '')
        .split(',')
        .filter((value) => /^\d+$/.test(value))
        .map(Number)
        .filter((id) => Number.isSafeInteger(id) && id > 0),
    ),
  ].slice(0, 3),
)
let request = 0
candidate.ensureLoaded().catch(() => undefined)

async function load() {
  const current = ++request
  loading.value = true
  failed.value = []
  const selected = [...ids.value]
  const results = await Promise.allSettled(selected.map(getJobPosting))
  if (current !== request) return
  jobs.value = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
  failed.value = selected.filter((_, index) => results[index]?.status === 'rejected')
  loading.value = false
}
function remove(id: number) {
  // Also out of the selection kept on the job list.
  comparison.remove(id)
  router.replace({
    query: { ...route.query, offerte: ids.value.filter((item) => item !== id).join(',') },
  })
}
watch(ids, load, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <RouterLink :to="{ name: 'home' }" class="text-sm text-indigo-600"
      >← Cerca altre offerte</RouterLink
    >
    <header>
      <h1 class="text-2xl font-bold text-slate-900">Confronta le offerte</h1>
      <p class="mt-1 text-slate-600">Valuta fino a tre opportunità fianco a fianco.</p>
    </header>
    <div v-if="loading" class="h-80 animate-pulse rounded-xl bg-slate-200/70" aria-busy="true" />
    <template v-else>
      <div
        v-if="failed.length"
        role="alert"
        class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"
      >
        <p>{{ failed.length }} offerte non disponibili o impossibili da caricare.</p>
        <button type="button" class="btn-secondary mt-2" @click="load">Riprova</button>
      </div>
      <p
        v-if="jobs.length < 2"
        class="rounded-xl border border-slate-200 bg-white p-6 text-slate-600"
      >
        Seleziona almeno due offerte dalla lista per confrontarle.
      </p>
      <JobComparisonTable
        v-if="jobs.length"
        :jobs="jobs"
        :candidate-skills="candidate.skillIds"
        @remove="remove"
      />
    </template>
  </div>
</template>
