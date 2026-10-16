<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import FavoritesDrawer from '@/components/FavoritesDrawer.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const favoritesOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
    <AppHeader @open-favorites="favoritesOpen = true" />

    <main class="mx-auto max-w-5xl px-4 py-8">
      <RouterView />
    </main>

    <FavoritesDrawer v-model:open="favoritesOpen" />
    <ToastContainer />
  </div>
</template>
