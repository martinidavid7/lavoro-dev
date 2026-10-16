<script setup lang="ts">
import { computed, useId } from 'vue'
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from '@/types/application'
import { formatDate } from '@/utils/formatters'
import AvatarImage from './AvatarImage.vue'
import SkillBadges from './SkillBadges.vue'

const props = defineProps<{
  application: Application
  requiredSkills: number[]
  disabled: boolean
}>()
const emit = defineEmits<{
  move: [status: ApplicationStatus]
  downloadCv: []
  dragStart: [event: DragEvent]
  dragEnd: []
}>()
const statusId = useId()
const candidate = computed(() => props.application.candidate)
const matching = computed(
  () =>
    candidate.value?.skills.filter((skill) => props.requiredSkills.includes(skill.id)).length ?? 0,
)
function change(event: Event) {
  emit('move', (event.target as HTMLSelectElement).value as ApplicationStatus)
}
</script>

<template>
  <article
    :draggable="!disabled"
    :aria-busy="disabled"
    class="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs"
    :class="{ 'opacity-60': disabled }"
    @dragstart="emit('dragStart', $event)"
    @dragend="emit('dragEnd')"
  >
    <header class="flex items-start gap-3">
      <AvatarImage
        :name="candidate?.name ?? 'Candidato'"
        :image-url="candidate?.photo_url ?? null"
        size="sm"
        round
      />
      <div class="min-w-0">
        <h3 class="font-semibold wrap-break-word text-slate-900">
          {{ candidate?.name ?? 'Candidato' }}
        </h3>
        <p class="text-xs text-slate-500">{{ candidate?.headline }}</p>
      </div>
    </header>
    <p class="text-xs text-slate-500">Candidatura del {{ formatDate(application.created_at) }}</p>
    <p v-if="candidate?.city || candidate?.experience_years != null" class="text-xs text-slate-600">
      {{ candidate?.city
      }}<template v-if="candidate?.experience_years != null">
        · {{ candidate.experience_years }} anni di esperienza</template
      >
    </p>
    <SkillBadges
      v-if="candidate"
      :skills="candidate.skills"
      :matching="requiredSkills"
      :limit="4"
    />
    <p v-if="requiredSkills.length" class="text-xs text-slate-500">
      {{ matching }} su {{ requiredSkills.length }} competenze richieste
    </p>
    <details class="text-sm">
      <summary class="cursor-pointer text-indigo-700">Dettagli e contatti</summary>
      <div class="mt-2 space-y-2">
        <p v-if="candidate?.bio" class="whitespace-pre-wrap wrap-break-word">{{ candidate.bio }}</p>
        <a
          v-if="candidate?.email"
          :href="`mailto:${candidate.email}`"
          class="block break-all text-indigo-700"
          >{{ candidate.email }}</a
        >
        <a
          v-if="candidate?.phone"
          :href="`tel:${candidate.phone.replace(/[^\d+]/g, '')}`"
          class="block text-indigo-700"
          >{{ candidate.phone }}</a
        >
        <p
          v-if="application.cover_letter"
          class="whitespace-pre-wrap wrap-break-word text-slate-600"
        >
          {{ application.cover_letter }}
        </p>
        <button type="button" class="btn-secondary w-full" @click="emit('downloadCv')">
          Scarica CV
        </button>
      </div>
    </details>
    <div class="border-t border-slate-100 pt-3">
      <label :for="statusId" class="mb-1 block text-xs text-slate-500"
        >Sposta {{ candidate?.name ?? 'candidato' }}</label
      >
      <select
        :id="statusId"
        :value="application.status"
        :disabled="disabled"
        class="field"
        data-test="board-status"
        @change="change"
      >
        <option v-for="status in APPLICATION_STATUSES" :key="status.value" :value="status.value">
          {{ status.label }}
        </option>
      </select>
    </div>
  </article>
</template>
