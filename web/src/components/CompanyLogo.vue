<script setup lang="ts">
import { computed } from 'vue'
import { initials } from '@/utils/company'

const props = withDefaults(
  defineProps<{
    name: string
    logoUrl: string | null
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const sizeClass = computed(
  () => ({ sm: 'size-10 text-sm', md: 'size-14 text-lg', lg: 'size-24 text-3xl' })[props.size],
)
</script>

<template>
  <img
    v-if="logoUrl"
    :src="logoUrl"
    :alt="`Logo di ${name}`"
    class="shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
    :class="sizeClass"
  />
  <span
    v-else
    class="grid shrink-0 place-items-center rounded-lg bg-indigo-100 font-semibold text-indigo-700"
    :class="sizeClass"
    aria-hidden="true"
    data-test="logo-initials"
  >
    {{ initials(name) }}
  </span>
</template>
