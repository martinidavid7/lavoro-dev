<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import FormField from '@/components/FormField.vue'
import SkillPicker from '@/components/SkillPicker.vue'
import { useApiForm } from '@/composables/useApiForm'
import { createJobPosting, updateJobPosting } from '@/services/jobPostings'
import { useNotificationsStore } from '@/stores/notifications'
import {
  CONTRACT_TYPES,
  WORK_MODES,
  type ContractType,
  type WorkMode,
  type JobPosting,
  type JobPostingPayload,
} from '@/types/jobPosting'

import JobPostingPreview from './JobPostingPreview.vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ initialJob?: JobPosting }>()
const auth = useAuthStore()
const router = useRouter()
const notifications = useNotificationsStore()

const form = reactive({
  title: props.initialJob?.title ?? '',
  description: props.initialJob?.description ?? '',
  salary: (props.initialJob ? Number(props.initialJob.salary) : null) as number | null,
  work_mode: (props.initialJob?.work_mode ?? null) as WorkMode | null,
  contract_type: (props.initialJob?.contract_type ?? null) as ContractType | null,
  skills: props.initialJob?.skills.map((skill) => skill.id) ?? ([] as number[]),
})

const { errors, submitting, submit, errorsFor } = useApiForm("Impossibile salvare l'offerta")

async function publish() {
  if (submitting.value) return
  // Validation stays on the server for both creation and editing.
  const payload = { ...form, skills: [...form.skills] } as JobPostingPayload
  const job = await submit(() =>
    props.initialJob ? updateJobPosting(props.initialJob.id, payload) : createJobPosting(payload),
  )

  if (!job) return

  notifications.success(
    props.initialJob ? 'Offerta aggiornata!' : 'Offerta pubblicata!',
    `"${job.title}" è ora visibile sulla piattaforma.`,
  )
  router.push({ name: 'jobs.show', params: { id: job.id } })
}
</script>

<template>
  <div class="grid items-start gap-6 lg:grid-cols-2">
    <form
      class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
      novalidate
      @submit.prevent="publish"
    >
      <fieldset :disabled="submitting" class="space-y-5">
        <FormField
          id="title"
          v-slot="{ invalid }"
          label="Titolo dell'offerta"
          hint="Ad esempio: Sviluppatore Vue.js Senior"
          :errors="errors.title"
        >
          <input
            id="title"
            v-model.trim="form.title"
            type="text"
            class="field"
            :class="{ 'field-invalid': invalid }"
            :aria-invalid="invalid"
          />
        </FormField>

        <FormField
          id="description"
          v-slot="{ invalid }"
          label="Descrizione"
          hint="Attività, requisiti e benefit."
          :errors="errors.description"
        >
          <textarea
            id="description"
            v-model.trim="form.description"
            rows="6"
            class="field"
            :class="{ 'field-invalid': invalid }"
            :aria-invalid="invalid"
          />
        </FormField>

        <div class="grid gap-5 sm:grid-cols-3">
          <FormField
            id="salary"
            v-slot="{ invalid }"
            label="RAL (€)"
            hint="Retribuzione annua lorda."
            :errors="errors.salary"
          >
            <input
              id="salary"
              v-model.number="form.salary"
              type="number"
              min="0"
              step="1000"
              class="field"
              :class="{ 'field-invalid': invalid }"
              :aria-invalid="invalid"
            />
          </FormField>

          <FormField
            id="work_mode"
            v-slot="{ invalid }"
            label="Modalità di lavoro"
            :errors="errors.work_mode"
          >
            <select
              id="work_mode"
              v-model="form.work_mode"
              class="field"
              :class="{ 'field-invalid': invalid }"
              :aria-invalid="invalid"
            >
              <option :value="null" disabled>Seleziona</option>
              <option v-for="option in WORK_MODES" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </FormField>

          <FormField
            id="contract_type"
            v-slot="{ invalid }"
            label="Contratto"
            :errors="errors.contract_type"
          >
            <select
              id="contract_type"
              v-model="form.contract_type"
              class="field"
              :class="{ 'field-invalid': invalid }"
              :aria-invalid="invalid"
            >
              <option :value="null" disabled>Seleziona</option>
              <option v-for="option in CONTRACT_TYPES" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </FormField>
        </div>

        <FormField
          id="skills"
          label="Competenze richieste"
          hint="I candidati con queste competenze vedranno la tua offerta tra le prime."
          :errors="errorsFor('skills')"
        >
          <SkillPicker
            id="skills"
            v-model="form.skills"
            :max="15"
            :invalid="!!errorsFor('skills')"
          />
        </FormField>
      </fieldset>
      <div class="flex justify-end border-t border-slate-100 pt-5">
        <button type="submit" class="btn-primary" :disabled="submitting">
          {{ submitting ? 'Salvataggio…' : initialJob ? 'Salva modifiche' : "Pubblica l'offerta" }}
        </button>
      </div>
    </form>
    <JobPostingPreview
      :title="form.title"
      :description="form.description"
      :salary="form.salary"
      :work-mode="form.work_mode"
      :contract-type="form.contract_type"
      :skills="form.skills"
      :company="auth.user?.name ?? 'La tua azienda'"
    />
  </div>
</template>
