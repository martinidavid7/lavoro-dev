<script setup lang="ts">
import { reactive, watch } from 'vue'
import { CONTRACT_TYPES, WORK_MODES, type JobPostingFilters } from '@/types/jobPosting'

const props = defineProps<{ filters: JobPostingFilters }>()
const emit = defineEmits<{ search: [filters: JobPostingFilters] }>()

const form = reactive<JobPostingFilters>({})

// Keeps the form in sync with the URL (e.g. the browser back button).
watch(
  () => props.filters,
  ({ title, work_mode, contract_type }) => Object.assign(form, { title, work_mode, contract_type }),
  { immediate: true },
)

function search() {
  emit('search', { ...form, title: form.title?.trim() || undefined })
}

function clear() {
  Object.assign(form, { title: undefined, work_mode: undefined, contract_type: undefined })
  search()
}
</script>

<template>
  <form
    class="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-[1fr_auto_auto_auto]"
    role="search"
    @submit.prevent="search"
  >
    <label class="sr-only" for="filter-title">Titolo dell'offerta</label>
    <input
      id="filter-title"
      v-model="form.title"
      type="search"
      class="field"
      placeholder="Cerca per ruolo o tecnologia: PHP, Vue, DevOps…"
    />

    <label class="sr-only" for="filter-work-mode">Modalità di lavoro</label>
    <select id="filter-work-mode" v-model="form.work_mode" class="field">
      <option :value="undefined">Tutte le modalità</option>
      <option v-for="option in WORK_MODES" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <label class="sr-only" for="filter-contract-type">Tipo di contratto</label>
    <select id="filter-contract-type" v-model="form.contract_type" class="field">
      <option :value="undefined">Tutti i contratti</option>
      <option v-for="option in CONTRACT_TYPES" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <div class="flex gap-2">
      <button type="submit" class="btn-primary flex-1">Cerca</button>
      <button type="button" class="btn-secondary" @click="clear">Azzera</button>
    </div>
  </form>
</template>
