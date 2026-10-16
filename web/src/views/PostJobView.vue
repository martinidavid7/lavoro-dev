<script setup lang="ts">
import JobPostingForm from '@/components/JobPostingForm.vue'
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Pubblica un'offerta</h1>
      <p class="mt-1 text-slate-600">
        Presenta la tua offerta e controlla l'anteprima prima di pubblicarla.
      </p>
    </header>
    <JobPostingForm />
  </div>
</template>
