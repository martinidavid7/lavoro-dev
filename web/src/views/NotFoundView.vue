<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="py-20 text-center">
    <p class="text-sm font-semibold text-indigo-600">404</p>
    <h1 class="mt-2 text-2xl font-bold text-slate-900">Pagina non trovata</h1>
    <p class="mt-2 text-slate-600">L'indirizzo che hai visitato non esiste.</p>
    <RouterLink to="/" class="btn-primary mt-6">Vedi le offerte</RouterLink>
  </div>
</template>
