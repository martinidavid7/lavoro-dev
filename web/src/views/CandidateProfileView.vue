<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import CvUploader from '@/components/CvUploader.vue'
import FormField from '@/components/FormField.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import SkillPicker from '@/components/SkillPicker.vue'
import { useApiForm } from '@/composables/useApiForm'
import {
  deleteCv,
  deletePhoto,
  downloadCv,
  updateCandidateProfile,
  uploadCv,
  uploadPhoto,
} from '@/services/candidateProfile'
import { useCandidateStore } from '@/stores/candidate'
import { useNotificationsStore } from '@/stores/notifications'
import type { CandidateProfile, CandidateProfilePayload } from '@/types/candidate'

const candidate = useCandidateStore()
const notifications = useNotificationsStore()

const loadError = ref(false)
const busy = reactive({ photo: false, cv: false })

const form = reactive<CandidateProfilePayload>({
  name: '',
  phone: null,
  city: null,
  headline: null,
  experience_years: null,
  bio: null,
  linkedin_url: null,
  github_url: null,
  portfolio_url: null,
  skills: [],
})

const { errors, submitting, submit, errorsFor } = useApiForm('Impossibile salvare il profilo')

const profile = computed(() => candidate.profile)

/** How complete the profile is, to nudge the candidate to fill it in. */
const completion = computed(() => {
  const p = profile.value
  if (!p) return 0

  const checks = [
    p.photo_url,
    p.headline,
    p.city,
    p.bio,
    p.cv,
    p.skills.length,
    p.linkedin_url || p.github_url,
  ]

  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})

function fill(data: CandidateProfile) {
  Object.assign(form, {
    name: data.name,
    phone: data.phone,
    city: data.city,
    headline: data.headline,
    experience_years: data.experience_years,
    bio: data.bio,
    linkedin_url: data.linkedin_url,
    github_url: data.github_url,
    portfolio_url: data.portfolio_url,
    skills: data.skills.map((skill) => skill.id),
  })
}

candidate
  .ensureLoaded()
  .then(() => candidate.profile && fill(candidate.profile))
  .catch(() => (loadError.value = true))

/** Empty inputs are sent as null, so the API clears the field. */
function payload(): CandidateProfilePayload {
  const blankToNull = (value: string | null) => (value?.trim() ? value.trim() : null)

  return {
    ...form,
    name: form.name.trim(),
    phone: blankToNull(form.phone),
    city: blankToNull(form.city),
    headline: blankToNull(form.headline),
    // v-model.number leaves an emptied number input as ''.
    experience_years: typeof form.experience_years === 'number' ? form.experience_years : null,
    bio: blankToNull(form.bio),
    linkedin_url: blankToNull(form.linkedin_url),
    github_url: blankToNull(form.github_url),
    portfolio_url: blankToNull(form.portfolio_url),
  }
}

async function save() {
  const saved = await submit(() => updateCandidateProfile(payload()))

  if (!saved) return

  candidate.set(saved)
  notifications.success('Profilo aggiornato')
}

/** Uploads or removes the photo or the CV; the rest of the form is left as it is. */
async function changeFile(
  kind: keyof typeof busy,
  action: () => Promise<CandidateProfile>,
  message: string,
) {
  busy[kind] = true

  try {
    candidate.set(await action())
    notifications.success(message)
  } catch (e) {
    notifications.error('Operazione non riuscita', e instanceof Error ? e.message : undefined)
  } finally {
    busy[kind] = false
  }
}

async function download() {
  try {
    await downloadCv()
  } catch (e) {
    notifications.error(
      'Impossibile scaricare il curriculum',
      e instanceof Error ? e.message : undefined,
    )
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <section class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Il mio profilo</h1>
        <p class="mt-1 text-slate-600">
          Un profilo completo ti aiuta a trovare le offerte giuste e a farti notare dalle aziende.
        </p>
      </div>
      <RouterLink
        v-if="profile?.skills.length"
        :to="{ name: 'home', query: { competenze: profile.skills.map((s) => s.id).join(',') } }"
        class="btn-secondary"
      >
        Offerte per le mie competenze
      </RouterLink>
    </section>

    <div v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p class="font-medium text-red-700">Impossibile caricare il profilo.</p>
    </div>

    <template v-else-if="profile">
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs" data-test="completion">
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium text-slate-700">Profilo completo al {{ completion }}%</span>
          <span v-if="completion === 100" class="text-emerald-600">Ottimo lavoro!</span>
        </div>
        <div
          class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          :aria-valuenow="completion"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Completamento del profilo"
        >
          <div
            class="h-full rounded-full bg-indigo-600 transition-all"
            :style="{ width: `${completion}%` }"
          />
        </div>
      </div>

      <section class="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 class="font-semibold text-slate-900">Foto</h2>
        <ImageUploader
          kind="photo"
          :name="form.name || profile.name"
          :image-url="profile.photo_url"
          :busy="busy.photo"
          @upload="(file) => changeFile('photo', () => uploadPhoto(file), 'Foto aggiornata')"
          @remove="changeFile('photo', deletePhoto, 'Foto rimossa')"
        />
      </section>

      <section class="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 class="font-semibold text-slate-900">Curriculum</h2>
        <CvUploader
          :cv="profile.cv"
          :busy="busy.cv"
          @upload="(file) => changeFile('cv', () => uploadCv(file), 'Curriculum caricato')"
          @download="download"
          @remove="changeFile('cv', deleteCv, 'Curriculum rimosso')"
        />
      </section>

      <form
        class="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
        novalidate
        @submit.prevent="save"
      >
        <fieldset class="space-y-5">
          <legend class="font-semibold text-slate-900">Dati personali</legend>

          <FormField id="name" v-slot="{ invalid }" label="Nome e cognome" :errors="errors.name">
            <input
              id="name"
              v-model="form.name"
              type="text"
              autocomplete="name"
              class="field"
              :class="{ 'field-invalid': invalid }"
              :aria-invalid="invalid"
            />
          </FormField>

          <div class="grid gap-5 sm:grid-cols-2">
            <FormField id="email" label="Email" hint="È l'email con cui accedi.">
              <input
                id="email"
                :value="profile.email"
                type="email"
                class="field bg-slate-50"
                disabled
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

          <FormField id="city" v-slot="{ invalid }" label="Città" :errors="errors.city">
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
        </fieldset>

        <fieldset class="space-y-5 border-t border-slate-100 pt-5">
          <legend class="font-semibold text-slate-900">Profilo professionale</legend>

          <div class="grid gap-5 sm:grid-cols-[1fr_10rem]">
            <FormField
              id="headline"
              v-slot="{ invalid }"
              label="Qualifica"
              hint="Es.: Sviluppatrice Front-end"
              :errors="errors.headline"
            >
              <input
                id="headline"
                v-model="form.headline"
                type="text"
                class="field"
                :class="{ 'field-invalid': invalid }"
                :aria-invalid="invalid"
              />
            </FormField>

            <FormField
              id="experience_years"
              v-slot="{ invalid }"
              label="Anni di esperienza"
              :errors="errors.experience_years"
            >
              <input
                id="experience_years"
                v-model.number="form.experience_years"
                type="number"
                min="0"
                max="50"
                class="field"
                :class="{ 'field-invalid': invalid }"
                :aria-invalid="invalid"
              />
            </FormField>
          </div>

          <FormField
            id="bio"
            v-slot="{ invalid }"
            label="Presentazione"
            hint="Chi sei, cosa sai fare e cosa cerchi."
            :errors="errors.bio"
          >
            <textarea
              id="bio"
              v-model="form.bio"
              rows="5"
              class="field"
              :class="{ 'field-invalid': invalid }"
              :aria-invalid="invalid"
            />
          </FormField>
        </fieldset>

        <fieldset class="space-y-3 border-t border-slate-100 pt-5">
          <legend class="font-semibold text-slate-900">Competenze</legend>
          <p class="text-sm text-slate-600">Le usiamo per mostrarti le offerte più adatte a te.</p>
          <FormField id="skills" label="Le tue competenze" :errors="errorsFor('skills')">
            <SkillPicker id="skills" v-model="form.skills" :invalid="!!errorsFor('skills')" />
          </FormField>
        </fieldset>

        <fieldset class="space-y-5 border-t border-slate-100 pt-5">
          <legend class="font-semibold text-slate-900">Link</legend>

          <FormField
            id="linkedin_url"
            v-slot="{ invalid }"
            label="LinkedIn"
            hint="https://www.linkedin.com/in/…"
            :errors="errors.linkedin_url"
          >
            <input
              id="linkedin_url"
              v-model="form.linkedin_url"
              type="url"
              class="field"
              :class="{ 'field-invalid': invalid }"
              :aria-invalid="invalid"
            />
          </FormField>

          <div class="grid gap-5 sm:grid-cols-2">
            <FormField
              id="github_url"
              v-slot="{ invalid }"
              label="GitHub"
              hint="https://github.com/…"
              :errors="errors.github_url"
            >
              <input
                id="github_url"
                v-model="form.github_url"
                type="url"
                class="field"
                :class="{ 'field-invalid': invalid }"
                :aria-invalid="invalid"
              />
            </FormField>

            <FormField
              id="portfolio_url"
              v-slot="{ invalid }"
              label="Portfolio o sito personale"
              :errors="errors.portfolio_url"
            >
              <input
                id="portfolio_url"
                v-model="form.portfolio_url"
                type="url"
                autocomplete="url"
                class="field"
                :class="{ 'field-invalid': invalid }"
                :aria-invalid="invalid"
              />
            </FormField>
          </div>
        </fieldset>

        <div class="flex justify-end border-t border-slate-100 pt-5">
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Salvataggio…' : 'Salva profilo' }}
          </button>
        </div>
      </form>
    </template>

    <div v-else class="h-96 animate-pulse rounded-xl bg-slate-200/70" aria-busy="true" />
  </div>
</template>
