<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import FavoritasDrawer from '@/components/FavoritasDrawer.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const favoritasAberto = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
    <AppHeader @abrir-favoritas="favoritasAberto = true" />

    <main class="mx-auto max-w-5xl px-4 py-8">
      <RouterView />
    </main>

    <FavoritasDrawer v-model:aberto="favoritasAberto" />
    <ToastContainer />
  </div>
</template>
