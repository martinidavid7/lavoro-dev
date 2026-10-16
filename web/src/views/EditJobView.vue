<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import JobPostingForm from '@/components/JobPostingForm.vue'
import { getJobPosting } from '@/services/jobPostings'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/services/http'
import type { JobPosting } from '@/types/jobPosting'

const props = defineProps<{ id: number }>()
const auth = useAuthStore()
const job = ref<JobPosting | null>(null)
const error = ref('')
let request = 0
async function load() {
  const current = ++request
  job.value = null
  error.value = ''
  try {
    const result = await getJobPosting(props.id)
    if (current !== request) return
    if (!auth.canManage(result)) {
      error.value = 'Puoi modificare solo le tue offerte.'
      return
    }
    job.value = result
  } catch (e) {
    if (current !== request) return
    error.value =
      e instanceof ApiError && e.isNotFound
        ? 'Questa offerta non esiste più.'
        : "Impossibile caricare l'offerta."
  }
}
watch(() => props.id, load, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <RouterLink :to="{ name: 'jobs.show', params: { id } }" class="text-sm text-indigo-600"
      >← Torna all'offerta</RouterLink
    >
    <header>
      <h1 class="text-2xl font-bold text-slate-900">Modifica offerta</h1>
      <p class="mt-1 text-slate-600">
        Aggiorna i dettagli e controlla l'anteprima prima di salvare.
      </p>
    </header>
    <div v-if="error" role="alert" class="rounded-xl border border-red-200 bg-white p-6">
      <p>{{ error }}</p>
      <button type="button" class="btn-secondary mt-3" @click="load">Riprova</button>
    </div>
    <JobPostingForm v-else-if="job" :key="job.id" :initial-job="job" />
    <div v-else aria-busy="true" class="h-80 animate-pulse rounded-xl bg-slate-200/70" />
  </div>
</template>
