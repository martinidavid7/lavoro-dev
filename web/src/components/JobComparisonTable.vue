<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { JobPosting } from '@/types/jobPosting'
import { formatCurrency, formatDate } from '@/utils/formatters'
import SkillBadges from './SkillBadges.vue'

const props = defineProps<{ jobs: JobPosting[]; candidateSkills: number[] }>()
defineEmits<{ remove: [id: number] }>()
const differencesOnly = ref(false)
const fields = [
  {
    key: 'salary',
    label: 'Retribuzione annua lorda',
    value: (job: JobPosting) => formatCurrency(job.salary),
  },
  {
    key: 'work_mode',
    label: 'Modalità di lavoro',
    value: (job: JobPosting) => job.work_mode_label,
  },
  { key: 'contract_type', label: 'Contratto', value: (job: JobPosting) => job.contract_type_label },
  {
    key: 'published_at',
    label: 'Pubblicata il',
    value: (job: JobPosting) => formatDate(job.published_at),
  },
  {
    key: 'skills',
    label: 'Competenze richieste',
    value: (job: JobPosting) =>
      [...job.skills]
        .map((skill) => skill.id)
        .sort((a, b) => a - b)
        .join(','),
  },
  { key: 'description', label: 'Descrizione', value: (job: JobPosting) => job.description },
]
const rows = computed(() =>
  fields
    .map((field) => ({ ...field, differs: new Set(props.jobs.map(field.value)).size > 1 }))
    .filter((field) => !differencesOnly.value || field.differs),
)
const maxSalary = computed(() => Math.max(...props.jobs.map((job) => Number(job.salary))))
</script>

<template>
  <div class="space-y-4">
    <label class="flex items-center gap-2 text-sm"
      ><input v-model="differencesOnly" type="checkbox" class="size-4 accent-indigo-600" /> Mostra
      solo le differenze</label
    >
    <p class="text-xs text-slate-500">
      Le righe evidenziate contengono differenze. Su schermi piccoli scorri la tabella
      orizzontalmente.
    </p>
    <div
      role="region"
      aria-label="Confronto dettagliato delle offerte"
      tabindex="0"
      class="overflow-x-auto rounded-xl border border-slate-200 bg-white"
    >
      <table class="w-full border-collapse text-left text-sm">
        <caption class="sr-only">
          Confronto tra
          {{
            jobs.length
          }}
          offerte di lavoro
        </caption>
        <thead>
          <tr class="align-top">
            <th scope="col" class="min-w-36 p-4">Caratteristica</th>
            <th
              v-for="job in jobs"
              :key="job.id"
              scope="col"
              class="min-w-60 border-l border-slate-200 p-4"
            >
              <RouterLink
                :to="{ name: 'jobs.show', params: { id: job.id } }"
                class="text-lg font-semibold text-indigo-700 hover:underline"
                >{{ job.title }}</RouterLink
              >
              <p class="mt-1 font-normal text-slate-500">{{ job.company.name }}</p>
              <button
                type="button"
                class="btn-danger mt-2 px-0"
                :aria-label="`Rimuovi ${job.title} dal confronto`"
                @click="$emit('remove', job.id)"
              >
                Rimuovi
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.key"
            class="border-t border-slate-200 align-top"
            :class="{ 'bg-indigo-50/50': row.differs }"
          >
            <th scope="row" class="p-4 font-medium text-slate-700">{{ row.label }}</th>
            <td v-for="job in jobs" :key="job.id" class="border-l border-slate-200 p-4">
              <template v-if="row.key === 'skills'">
                <SkillBadges
                  v-if="job.skills.length"
                  :skills="job.skills"
                  :matching="candidateSkills"
                />
                <span v-else class="text-slate-500">Non specificate</span>
                <p
                  v-if="candidateSkills.length && job.skills.length"
                  class="mt-2 text-xs text-slate-500"
                >
                  {{ job.skills.filter((skill) => candidateSkills.includes(skill.id)).length }} su
                  {{ job.skills.length }} nel tuo profilo
                </p>
              </template>
              <template v-else>
                <p class="whitespace-pre-wrap wrap-break-word">{{ row.value(job) }}</p>
                <span
                  v-if="row.key === 'salary' && row.differs && Number(job.salary) === maxSalary"
                  class="mt-2 inline-block rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-800"
                  >RAL più alta</span
                >
              </template>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td :colspan="jobs.length + 1" class="p-6 text-center text-slate-500">
              Nessuna differenza nei dettagli confrontati.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
