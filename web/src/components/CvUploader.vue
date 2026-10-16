<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import type { CandidateProfile } from '@/types/candidate'
import { formatDate } from '@/utils/formatters'
import { CV_TYPES, validateCv } from '@/utils/files'

/** Uploads, downloads and removes the candidate's CV (PDF). */
withDefaults(defineProps<{ cv: CandidateProfile['cv']; busy?: boolean }>(), { busy: false })

const emit = defineEmits<{ upload: [file: File]; download: []; remove: [] }>()

const input = useTemplateRef('input')
const error = ref<string | null>(null)

function choose(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]

  if (input.value) input.value.value = ''
  if (!file) return

  error.value = validateCv(file)
  if (!error.value) emit('upload', file)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="cv"
      class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
      data-test="current-cv"
    >
      <div class="flex min-w-0 items-center gap-3">
        <span
          class="grid size-10 shrink-0 place-items-center rounded-md bg-red-100 text-xs font-bold text-red-700"
          aria-hidden="true"
        >
          PDF
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-slate-900">{{ cv.name }}</p>
          <p class="text-xs text-slate-500">Aggiornato il {{ formatDate(cv.updated_at) }}</p>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          type="button"
          class="btn-secondary px-3 py-1.5"
          :disabled="busy"
          @click="emit('download')"
        >
          Scarica
        </button>
        <button
          type="button"
          class="btn-danger px-3 py-1.5"
          :disabled="busy"
          data-test="remove-cv"
          @click="emit('remove')"
        >
          Rimuovi
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <button type="button" class="btn-secondary" :disabled="busy" @click="input?.click()">
        {{ cv ? 'Sostituisci curriculum' : 'Carica curriculum' }}
      </button>
      <p v-if="error" class="text-xs text-red-600" role="alert" data-test="cv-error">{{ error }}</p>
      <p v-else class="text-xs text-slate-500">
        PDF, massimo 5 MB. Sarà visibile solo alle aziende a cui ti candidi.
      </p>
    </div>

    <input
      ref="input"
      type="file"
      class="sr-only"
      :accept="CV_TYPES.join(',')"
      aria-label="Curriculum in PDF"
      data-test="cv-input"
      @change="choose"
    />
  </div>
</template>
