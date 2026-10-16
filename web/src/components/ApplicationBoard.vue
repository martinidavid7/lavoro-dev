<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from '@/types/application'
import ApplicationColumn from './ApplicationColumn.vue'

const props = defineProps<{
  applications: Application[]
  requiredSkills: number[]
  updating: number | null
}>()
const emit = defineEmits<{
  move: [application: Application, status: ApplicationStatus]
  downloadCv: [application: Application]
}>()
const search = ref('')
const sort = ref('recent')
const searchId = useId()
const sortId = useId()
const draggedId = ref<number | null>(null)
const matching = (application: Application) =>
  application.candidate?.skills.filter((skill) => props.requiredSkills.includes(skill.id)).length ??
  0
const filtered = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('it')
  return props.applications
    .filter(
      (application) => !term || application.candidate?.name.toLocaleLowerCase('it').includes(term),
    )
    .sort((a, b) => {
      if (sort.value === 'skills')
        return matching(b) - matching(a) || Date.parse(b.created_at) - Date.parse(a.created_at)
      if (sort.value === 'name')
        return (a.candidate?.name ?? '').localeCompare(b.candidate?.name ?? '', 'it')
      return Date.parse(b.created_at) - Date.parse(a.created_at)
    })
})
function start(event: DragEvent, application: Application) {
  if (props.updating !== null || !event.dataTransfer) return
  draggedId.value = application.id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(application.id))
}
function drop(event: DragEvent, status: ApplicationStatus) {
  if (props.updating !== null) return
  const id = Number(event.dataTransfer?.getData('text/plain'))
  const application = props.applications.find(
    (item) => item.id === id && item.id === draggedId.value,
  )
  draggedId.value = null
  if (application && application.status !== status) emit('move', application, status)
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
      <div>
        <label :for="searchId" class="mb-1 block text-sm font-medium">Cerca candidato</label
        ><input
          :id="searchId"
          v-model="search"
          type="search"
          class="field"
          placeholder="Nome del candidato"
        />
      </div>
      <div>
        <label :for="sortId" class="mb-1 block text-sm font-medium">Ordina per</label
        ><select :id="sortId" v-model="sort" class="field">
          <option value="recent">Più recenti</option>
          <option value="skills">Competenze in comune</option>
          <option value="name">Nome</option>
        </select>
      </div>
    </div>
    <p class="text-sm text-slate-500">
      Trascina una scheda in un'altra colonna oppure usa il menu “Sposta” sulla scheda.
    </p>
    <p v-if="search && !filtered.length" role="status" class="text-sm text-slate-500">
      Nessun candidato corrisponde alla ricerca.
    </p>
    <div
      class="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4"
      :aria-busy="updating !== null"
    >
      <ApplicationColumn
        v-for="status in APPLICATION_STATUSES"
        :key="status.value"
        :status="status.value"
        :label="status.label"
        :applications="filtered.filter((application) => application.status === status.value)"
        :total="applications.filter((application) => application.status === status.value).length"
        :required-skills="requiredSkills"
        :disabled="updating !== null"
        @move="(application, next) => emit('move', application, next)"
        @download-cv="emit('downloadCv', $event)"
        @drag-start="start"
        @drag-end="draggedId = null"
        @drop-application="drop"
      />
    </div>
  </div>
</template>
