<script setup lang="ts">
defineProps<{ preenchida?: boolean }>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :fill="preenchida ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9L12 3.5z"
    />
  </svg>
</template>
