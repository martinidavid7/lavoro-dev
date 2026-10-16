<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFavoritesStore } from '@/stores/favorites'
import { useNotificationsStore } from '@/stores/notifications'
import StarIcon from './StarIcon.vue'

defineEmits<{ openFavorites: [] }>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const favorites = useFavoritesStore()
const notifications = useNotificationsStore()

// "Offerte" and "Le mie offerte" are the same route with a different query,
// so the active link is decided here instead of by RouterLink.
const isOwnListing = computed(
  () => route.name === 'home' && route.query.azienda === String(auth.user?.id),
)
const isAllListing = computed(() => route.name === 'home' && !route.query.azienda)

const navLink = 'rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900'
const activeLink = 'bg-slate-100 text-slate-900'

async function logout() {
  try {
    await auth.logout()
    notifications.success('Sei uscito dal tuo account')

    if (route.meta.requiresAuth || route.meta.role) router.push({ name: 'home' })
  } catch (e) {
    notifications.error('Impossibile uscire', e instanceof Error ? e.message : undefined)
  }
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
      <RouterLink to="/" class="text-lg font-bold tracking-tight text-slate-900">
        lavoro<span class="text-indigo-600">.dev</span>
      </RouterLink>

      <nav class="flex items-center gap-1 text-sm font-medium">
        <RouterLink to="/" :class="[navLink, { [activeLink]: isAllListing }]">Offerte</RouterLink>
        <RouterLink
          v-if="auth.isCompany && auth.user"
          :to="{ name: 'home', query: { azienda: auth.user.id } }"
          :class="[navLink, { [activeLink]: isOwnListing }]"
          data-test="my-job-postings"
        >
          Le mie offerte
        </RouterLink>
        <RouterLink
          v-if="auth.isCompany"
          :to="{ name: 'jobs.create' }"
          class="rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900"
          exact-active-class="bg-slate-100 text-slate-900"
        >
          Pubblica un'offerta
        </RouterLink>
        <button
          type="button"
          class="relative ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Apri le offerte preferite"
          @click="$emit('openFavorites')"
        >
          <StarIcon class="size-5" />
          <span
            v-if="favorites.count"
            class="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white"
          >
            {{ favorites.count }}
          </span>
        </button>

        <div
          v-if="auth.user"
          class="ml-2 flex items-center gap-3 border-l border-slate-200 pl-3"
          data-test="user-menu"
        >
          <component
            :is="auth.isCompany ? RouterLink : 'span'"
            v-bind="
              auth.isCompany
                ? {
                    to: { name: 'company.show', params: { id: auth.user.id } },
                    title: 'La mia azienda',
                  }
                : {}
            "
            class="hidden text-right leading-tight sm:block"
            :class="{ 'rounded-lg px-2 py-1 hover:bg-slate-100': auth.isCompany }"
            data-test="user-name"
          >
            <span class="block text-slate-900">{{ auth.user.name }}</span>
            <span class="block text-xs font-normal text-slate-500">{{ auth.user.role_label }}</span>
          </component>
          <button type="button" class="btn-secondary px-3 py-1.5" @click="logout">Esci</button>
        </div>

        <div v-else class="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
          <RouterLink
            :to="{ name: 'login' }"
            class="rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900"
          >
            Accedi
          </RouterLink>
          <RouterLink :to="{ name: 'register' }" class="btn-primary px-3 py-1.5">
            Registrati
          </RouterLink>
        </div>
      </nav>
    </div>
  </header>
</template>
