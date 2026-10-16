<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="py-20 text-center">
    <p class="text-sm font-semibold text-indigo-600">404</p>
    <h1 class="mt-2 text-2xl font-bold text-slate-900">Página não encontrada</h1>
    <p class="mt-2 text-slate-600">O endereço que você acessou não existe.</p>
    <RouterLink to="/" class="btn-primario mt-6">Ver vagas</RouterLink>
  </div>
</template>
