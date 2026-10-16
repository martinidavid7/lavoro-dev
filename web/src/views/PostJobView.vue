<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import FormField from '@/components/FormField.vue'
import { useApiForm } from '@/composables/useApiForm'
import { createJobPosting } from '@/services/jobPostings'
import { useNotificationsStore } from '@/stores/notifications'
import { CONTRACT_TYPES, WORK_MODES, type ContractType, type WorkMode } from '@/types/jobPosting'

const router = useRouter()
const notifications = useNotificationsStore()

const form = reactive({
  title: '',
  description: '',
  salary: null as number | null,
  work_mode: null as WorkMode | null,
  contract_type: null as ContractType | null,
})

const { errors, submitting, submit } = useApiForm("Impossibile pubblicare l'offerta")

async function publish() {
  // The real validation lives in the API; null fields come back as a 422 error.
  const job = await submit(() => createJobPosting(form as Parameters<typeof createJobPosting>[0]))

  if (!job) return

  notifications.success('Offerta pubblicata!', `"${job.title}" è ora visibile sulla piattaforma.`)
  router.push({ name: 'jobs.show', params: { id: job.id } })
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <section>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Pubblica un'offerta</h1>
      <p class="mt-1 text-slate-600">
        Presenta la tua offerta a migliaia di professionisti, gratuitamente.
      </p>
    </section>

    <form
      class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
      novalidate
      @submit.prevent="publish"
    >
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

      <div class="flex justify-end border-t border-slate-100 pt-5">
        <button type="submit" class="btn-primary" :disabled="submitting">
          {{ submitting ? 'Pubblicazione…' : "Pubblica l'offerta" }}
        </button>
      </div>
    </form>
  </div>
</template>
