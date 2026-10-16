<script setup lang="ts">
import { computed } from 'vue'
import { initials } from '@/utils/company'

/** A company logo or a person's photo, with the initials as fallback. */
const props = withDefaults(
  defineProps<{
    name: string
    imageUrl: string | null
    size?: 'sm' | 'md' | 'lg'
    /** Round for people, square with rounded corners for companies. */
    round?: boolean
  }>(),
  { size: 'md', round: false },
)

const sizeClass = computed(
  () => ({ sm: 'size-10 text-sm', md: 'size-14 text-lg', lg: 'size-24 text-3xl' })[props.size],
)
const shapeClass = computed(() => (props.round ? 'rounded-full' : 'rounded-lg'))
</script>

<template>
  <img
    v-if="imageUrl"
    :src="imageUrl"
    :alt="round ? `Foto di ${name}` : `Logo di ${name}`"
    class="shrink-0 border border-slate-200 bg-white"
    :class="[sizeClass, shapeClass, round ? 'object-cover' : 'object-contain p-1']"
  />
  <span
    v-else
    class="grid shrink-0 place-items-center bg-indigo-100 font-semibold text-indigo-700"
    :class="[sizeClass, shapeClass]"
    aria-hidden="true"
    data-test="avatar-initials"
  >
    {{ initials(name) }}
  </span>
</template>
