<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import FormField from '@/components/FormField.vue'
import { useApiForm } from '@/composables/useApiForm'
import { safeRedirect } from '@/router/guards'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationsStore()

const form = reactive({ email: '', password: '' })
const { errors, submitting, submit } = useApiForm('Accesso non riuscito')

async function login() {
  const user = await submit(() => auth.login(form))

  if (!user) return

  notifications.success(`Bentornato, ${user.name}!`)
  router.push(safeRedirect(route.query.redirect))
}
</script>

<template>
  <div class="mx-auto max-w-md space-y-6">
    <section class="text-center">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Accedi</h1>
      <p class="mt-1 text-slate-600">Bentornato su lavoro.dev.</p>
    </section>

    <form
      class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
      novalidate
      @submit.prevent="login"
    >
      <FormField id="email" v-slot="{ invalid }" label="Email" :errors="errors.email">
        <input
          id="email"
          v-model.trim="form.email"
          type="email"
          autocomplete="email"
          class="field"
          :class="{ 'field-invalid': invalid }"
          :aria-invalid="invalid"
        />
      </FormField>

      <FormField id="password" v-slot="{ invalid }" label="Password" :errors="errors.password">
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          class="field"
          :class="{ 'field-invalid': invalid }"
          :aria-invalid="invalid"
        />
      </FormField>

      <button type="submit" class="btn-primary w-full" :disabled="submitting">
        {{ submitting ? 'Accesso…' : 'Accedi' }}
      </button>
    </form>

    <p class="text-center text-sm text-slate-600">
      Non hai un account?
      <RouterLink
        :to="{ name: 'register', query: route.query }"
        class="font-medium text-indigo-600 hover:text-indigo-500"
      >
        Registrati
      </RouterLink>
    </p>
  </div>
</template>
