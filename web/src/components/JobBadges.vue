<script setup lang="ts">
import type { JobPosting } from '@/types/jobPosting'

defineProps<{ job: Pick<JobPosting, 'work_mode_label' | 'contract_type_label'> }>()
</script>

<template>
  <div class="flex flex-wrap gap-2 text-xs font-medium">
    <span class="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
      {{ job.work_mode_label }}
    </span>
    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
      {{ job.contract_type_label }}
    </span>
  </div>
</template>
