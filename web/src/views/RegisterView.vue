<script setup lang="ts">
import { computed, reactive } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import FormField from '@/components/FormField.vue'
import { useApiForm } from '@/composables/useApiForm'
import { safeRedirect } from '@/router/guards'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { USER_ROLES, type RegisterPayload } from '@/types/user'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationsStore()

const form = reactive<RegisterPayload>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'candidate',
})

const { errors, submitting, submit } = useApiForm('Registrazione non riuscita')

// Companies sign up with the company name, candidates with their own.
const nameLabel = computed(() => (form.role === 'company' ? "Nome dell'azienda" : 'Nome e cognome'))

async function registerAccount() {
  const user = await submit(() => auth.register(form))

  if (!user) return

  notifications.success(`Benvenuto su lavoro.dev, ${user.name}!`)
  router.push(
    user.role === 'company' && !route.query.redirect
      ? { name: 'jobs.create' }
      : safeRedirect(route.query.redirect),
  )
}
</script>

<template>
  <div class="mx-auto max-w-md space-y-6">
    <section class="text-center">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Crea un account</h1>
      <p class="mt-1 text-slate-600">Trova lavoro o pubblica le tue offerte, gratuitamente.</p>
    </section>

    <form
      class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
      novalidate
      @submit.prevent="registerAccount"
    >
      <fieldset>
        <legend class="mb-1.5 block text-sm font-medium text-slate-700">Sono…</legend>
        <div class="grid grid-cols-2 gap-3">
          <label
            v-for="option in USER_ROLES"
            :key="option.value"
            class="cursor-pointer rounded-lg border p-3 transition has-focus-visible:ring-2 has-focus-visible:ring-indigo-500/40"
            :class="
              form.role === option.value
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-300 hover:bg-slate-50'
            "
          >
            <input
              v-model="form.role"
              type="radio"
              name="role"
              :value="option.value"
              class="sr-only"
              :data-test="`role-${option.value}`"
            />
            <span class="block text-sm font-semibold text-slate-900">{{ option.label }}</span>
            <span class="block text-xs text-slate-500">{{ option.description }}</span>
          </label>
        </div>
        <p v-if="errors.role?.length" class="mt-1.5 text-xs text-red-600">{{ errors.role[0] }}</p>
      </fieldset>

      <FormField id="name" v-slot="{ invalid }" :label="nameLabel" :errors="errors.name">
        <input
          id="name"
          v-model.trim="form.name"
          type="text"
          :autocomplete="form.role === 'company' ? 'organization' : 'name'"
          class="field"
          :class="{ 'field-invalid': invalid }"
          :aria-invalid="invalid"
        />
      </FormField>

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

      <div class="grid gap-5 sm:grid-cols-2">
        <FormField
          id="password"
          v-slot="{ invalid }"
          label="Password"
          hint="Almeno 8 caratteri."
          :errors="errors.password"
        >
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            class="field"
            :class="{ 'field-invalid': invalid }"
            :aria-invalid="invalid"
          />
        </FormField>

        <FormField id="password_confirmation" label="Conferma password">
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            type="password"
            autocomplete="new-password"
            class="field"
          />
        </FormField>
      </div>

      <button type="submit" class="btn-primary w-full" :disabled="submitting">
        {{ submitting ? 'Registrazione…' : 'Crea account' }}
      </button>
    </form>

    <p class="text-center text-sm text-slate-600">
      Hai già un account?
      <RouterLink
        :to="{ name: 'login', query: route.query }"
        class="font-medium text-indigo-600 hover:text-indigo-500"
      >
        Accedi
      </RouterLink>
    </p>
  </div>
</template>
