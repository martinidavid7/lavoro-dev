<script setup lang="ts">
import { computed } from 'vue'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/types/application'

const props = defineProps<{ status: ApplicationStatus }>()

const STYLES: Record<ApplicationStatus, string> = {
  in_review: 'bg-amber-50 text-amber-700 ring-amber-200',
  interview: 'bg-sky-50 text-sky-700 ring-sky-200',
  rejected: 'bg-slate-100 text-slate-600 ring-slate-200',
  hired: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

const label = computed(
  () => APPLICATION_STATUSES.find((status) => status.value === props.status)?.label,
)
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1"
    :class="STYLES[status]"
    data-test="status-badge"
  >
    {{ label }}
  </span>
</template>
