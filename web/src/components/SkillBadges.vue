<script setup lang="ts">
import { computed } from 'vue'
import type { Skill } from '@/types/skill'

/**
 * The skills of a job posting. Skills the candidate has are highlighted
 * and listed first; beyond `limit`, the rest is summarized as "+N".
 */
const props = withDefaults(
  defineProps<{
    skills: Skill[]
    matching?: number[]
    limit?: number
  }>(),
  { matching: () => [], limit: Infinity },
)

const sorted = computed(() =>
  [...props.skills].sort(
    (a, b) => Number(props.matching.includes(b.id)) - Number(props.matching.includes(a.id)),
  ),
)
const visible = computed(() => sorted.value.slice(0, props.limit))
const hidden = computed(() => sorted.value.length - visible.value.length)
</script>

<template>
  <ul v-if="skills.length" class="flex flex-wrap gap-1.5 text-xs" aria-label="Competenze">
    <li
      v-for="skill in visible"
      :key="skill.id"
      class="rounded-md px-2 py-0.5"
      :class="
        matching.includes(skill.id)
          ? 'bg-emerald-50 font-medium text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-slate-100 text-slate-600'
      "
      :data-test="matching.includes(skill.id) ? 'matching-skill' : 'skill'"
    >
      <span v-if="matching.includes(skill.id)" class="sr-only">Hai questa competenza: </span>
      {{ skill.name }}
    </li>
    <li v-if="hidden > 0" class="px-1 py-0.5 text-slate-500">+{{ hidden }}</li>
  </ul>
</template>
