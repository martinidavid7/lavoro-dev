<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { JobPosting } from '@/types/jobPosting'

defineProps<{ jobs: JobPosting[] }>()
defineEmits<{ remove: [id: number]; clear: [] }>()
</script>

<template>
  <section
    v-if="jobs.length"
    class="sticky bottom-4 z-20 space-y-3 rounded-xl border border-indigo-200 bg-white p-4 shadow-lg"
    aria-label="Offerte selezionate per il confronto"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm font-semibold" aria-live="polite">
        {{ jobs.length }} di 3 offerte selezionate
      </p>
      <div class="flex gap-2">
        <button type="button" class="btn-secondary" @click="$emit('clear')">Svuota</button>
        <RouterLink
          v-if="jobs.length >= 2"
          :to="{ name: 'jobs.compare', query: { offerte: jobs.map((job) => job.id).join(',') } }"
          class="btn-primary"
          >Confronta offerte</RouterLink
        >
        <span v-else class="self-center text-xs text-slate-500">Seleziona almeno 2 offerte</span>
      </div>
    </div>
    <ul class="flex flex-wrap gap-2">
      <li
        v-for="job in jobs"
        :key="job.id"
        class="flex max-w-full items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1 text-sm text-indigo-800"
      >
        <span class="truncate">{{ job.title }}</span>
        <button
          type="button"
          class="rounded px-2 py-1 hover:bg-indigo-100"
          :aria-label="`Rimuovi ${job.title} dal confronto`"
          @click="$emit('remove', job.id)"
        >
          ×
        </button>
      </li>
    </ul>
  </section>
</template>
