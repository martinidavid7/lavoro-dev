<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import FormField from '@/components/FormField.vue'
import LogoUploader from '@/components/LogoUploader.vue'
import { useApiForm } from '@/composables/useApiForm'
import {
  deleteCompanyLogo,
  getCompany,
  updateCompanyProfile,
  uploadCompanyLogo,
} from '@/services/companies'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { COMPANY_SIZES, type Company, type CompanyProfilePayload } from '@/types/company'

const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationsStore()

const company = ref<Company | null>(null)
const loadError = ref(false)
const logoBusy = ref(false)

const form = reactive<CompanyProfilePayload>({
  name: '',
  description: null,
  sector: null,
  city: null,
  size: null,
  website: null,
  contact_email: null,
  phone: null,
})

const { errors, submitting, submit } = useApiForm('Impossibile salvare il profilo')

function fill(data: Company) {
  company.value = data
  Object.assign(form, {
    name: data.name,
    description: data.description,
    sector: data.sector,
    city: data.city,
    size: data.size,
    website: data.website,
    contact_email: data.contact_email,
    phone: data.phone,
  })
}

// The route only lets companies in, so the user is loaded here.
const companyId = auth.user!.id

getCompany(companyId)
  .then(fill)
  .catch(() => (loadError.value = true))

/** Empty inputs are sent as null, so the API clears the field. */
function payload(): CompanyProfilePayload {
  const blankToNull = (value: string | null) => (value?.trim() ? value.trim() : null)

  return {
    ...form,
    name: form.name.trim(),
    description: blankToNull(form.description),
    sector: blankToNull(form.sector),
    city: blankToNull(form.city),
    website: blankToNull(form.website),
    contact_email: blankToNull(form.contact_email),
    phone: blankToNull(form.phone),
  }
}

async function save() {
  const saved = await submit(() => updateCompanyProfile(payload()))

  if (!saved) return

  if (auth.user) auth.user.name = saved.name
  notifications.success('Profilo aggiornato')
  router.push({ name: 'company.show', params: { id: saved.id } })
}

async function changeLogo(action: () => Promise<Company>, message: string) {
  logoBusy.value = true

  try {
    const updated = await action()
    if (company.value) company.value.logo_url = updated.logo_url
    notifications.success(message)
  } catch (e) {
    notifications.error(
      'Impossibile aggiornare il logo',
      e instanceof Error ? e.message : undefined,
    )
  } finally {
    logoBusy.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <section>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Profilo aziendale</h1>
      <p class="mt-1 text-slate-600">
        Queste informazioni compaiono nella pagina pubblica della tua azienda.
      </p>
    </section>

    <div v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p class="font-medium text-red-700">Impossibile caricare il profilo.</p>
    </div>

    <template v-else-if="company">
      <section class="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 class="font-semibold text-slate-900">Logo</h2>
        <LogoUploader
          :name="form.name || company.name"
          :logo-url="company.logo_url"
          :busy="logoBusy"
          @upload="(file) => changeLogo(() => uploadCompanyLogo(file), 'Logo aggiornato')"
          @remove="changeLogo(deleteCompanyLogo, 'Logo rimosso')"
        />
      </section>

      <form
        class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
        novalidate
        @submit.prevent="save"
      >
        <FormField id="name" v-slot="{ invalid }" label="Nome dell'azienda" :errors="errors.name">
          <input
            id="name"
            v-model="form.name"
            type="text"
            autocomplete="organization"
            class="field"
            :class="{ 'field-invalid': invalid }"
            :aria-invalid="invalid"
          />
        </FormField>

        <FormField
          id="description"
          v-slot="{ invalid }"
          label="Chi siamo"
          hint="Di cosa vi occupate, com'è lavorare con voi, i vostri valori."
          :errors="errors.description"
        >
          <textarea
            id="description"
            v-model="form.description"
            rows="6"
            class="field"
            :class="{ 'field-invalid': invalid }"
            :aria-invalid="invalid"
          />
        </FormField>

        <div class="grid gap-5 sm:grid-cols-3">
          <FormField
            id="sector"
            v-slot="{ invalid }"
            label="Settore"
            hint="Es.: Software e SaaS"
            :errors="errors.sector"
          >
            <input
              id="sector"
              v-model="form.sector"
              type="text"
              class="field"
              :class="{ 'field-invalid': invalid }"
              :aria-invalid="invalid"
            />
          </FormField>

          <FormField id="city" v-slot="{ invalid }" label="Sede" :errors="errors.city">
            <input
              id="city"
              v-model="form.city"
              type="text"
              autocomplete="address-level2"
              class="field"
              :class="{ 'field-invalid': invalid }"
              :aria-invalid="invalid"
            />
          </FormField>

          <FormField id="size" v-slot="{ invalid }" label="Dimensione" :errors="errors.size">
            <select
              id="size"
              v-model="form.size"
              class="field"
              :class="{ 'field-invalid': invalid }"
              :aria-invalid="invalid"
            >
              <option :value="null">Non specificata</option>
              <option v-for="option in COMPANY_SIZES" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </FormField>
        </div>

        <fieldset class="space-y-5 border-t border-slate-100 pt-5">
          <legend class="font-semibold text-slate-900">Contatti</legend>

          <FormField
            id="website"
            v-slot="{ invalid }"
            label="Sito web"
            hint="Es.: https://www.example.com"
            :errors="errors.website"
          >
            <input
              id="website"
              v-model="form.website"
              type="url"
              autocomplete="url"
              class="field"
              :class="{ 'field-invalid': invalid }"
              :aria-invalid="invalid"
            />
          </FormField>

          <div class="grid gap-5 sm:grid-cols-2">
            <FormField
              id="contact_email"
              v-slot="{ invalid }"
              label="Email di contatto"
              :errors="errors.contact_email"
            >
              <input
                id="contact_email"
                v-model="form.contact_email"
                type="email"
                autocomplete="email"
                class="field"
                :class="{ 'field-invalid': invalid }"
                :aria-invalid="invalid"
              />
            </FormField>

            <FormField id="phone" v-slot="{ invalid }" label="Telefono" :errors="errors.phone">
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                class="field"
                :class="{ 'field-invalid': invalid }"
                :aria-invalid="invalid"
              />
            </FormField>
          </div>
        </fieldset>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-5">
          <RouterLink
            :to="{ name: 'company.show', params: { id: companyId } }"
            class="btn-secondary"
          >
            Annulla
          </RouterLink>
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Salvataggio…' : 'Salva profilo' }}
          </button>
        </div>
      </form>
    </template>

    <div v-else class="h-96 animate-pulse rounded-xl bg-slate-200/70" aria-busy="true" />
  </div>
</template>
