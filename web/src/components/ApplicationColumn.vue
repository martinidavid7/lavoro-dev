<script setup lang="ts">
import { ref } from 'vue'
import ApplicationCard from './ApplicationCard.vue'
import type { Application, ApplicationStatus } from '@/types/application'

defineProps<{
  status: ApplicationStatus
  label: string
  applications: Application[]
  total: number
  requiredSkills: number[]
  disabled: boolean
}>()
const emit = defineEmits<{
  move: [application: Application, status: ApplicationStatus]
  dropApplication: [event: DragEvent, status: ApplicationStatus]
  dragStart: [event: DragEvent, application: Application]
  dragEnd: []
  downloadCv: [application: Application]
}>()
const over = ref(false)
function onDrop(event: DragEvent, status: ApplicationStatus) {
  over.value = false
  emit('dropApplication', event, status)
}
function onDragEnd() {
  over.value = false
  emit('dragEnd')
}
</script>

<template>
  <section
    class="min-w-0 space-y-3 rounded-xl border p-3 transition"
    :class="
      over && !disabled ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-100/70'
    "
    :aria-label="`${label}: ${total} candidature`"
    @dragover.prevent="over = true"
    @dragleave.self="over = false"
    @drop.prevent="onDrop($event, status)"
  >
    <h2 class="flex items-center justify-between gap-2 text-sm font-semibold text-slate-700">
      {{ label
      }}<span class="rounded-full bg-white px-2 py-0.5 text-xs"
        >{{ applications.length
        }}<template v-if="applications.length !== total"> / {{ total }}</template></span
      >
    </h2>
    <ApplicationCard
      v-for="application in applications"
      :key="application.id"
      :application="application"
      :required-skills="requiredSkills"
      :disabled="disabled"
      @move="emit('move', application, $event)"
      @download-cv="emit('downloadCv', application)"
      @drag-start="emit('dragStart', $event, application)"
      @drag-end="onDragEnd"
    />
    <p
      v-if="!applications.length"
      class="rounded-lg border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500"
    >
      Nessuna candidatura da mostrare
    </p>
  </section>
</template>
