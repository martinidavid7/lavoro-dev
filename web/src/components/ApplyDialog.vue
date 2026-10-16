<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useApiForm } from '@/composables/useApiForm'
import { useApplicationsStore } from '@/stores/applications'
import { useCandidateStore } from '@/stores/candidate'
import { useNotificationsStore } from '@/stores/notifications'
import type { JobPosting } from '@/types/jobPosting'

/** Applying to a job posting: the CV in the profile is sent, with an optional cover letter. */
const props = defineProps<{ job: Pick<JobPosting, 'id' | 'title' | 'company'> }>()

const open = defineModel<boolean>('open', { required: true })

const candidate = useCandidateStore()
const applications = useApplicationsStore()
const notifications = useNotificationsStore()

const coverLetter = ref('')
const textarea = useTemplateRef('textarea')
const { errors, submitting, submit } = useApiForm('Candidatura non inviata')

watch(open, async (isOpen) => {
  if (!isOpen) return

  errors.value = {}
  await nextTick()
  textarea.value?.focus()
})

async function send() {
  const application = await submit(() =>
    applications.apply(props.job.id, coverLetter.value.trim() || null),
  )

  if (!application) return

  notifications.success(
    'Candidatura inviata!',
    `${props.job.company.name} riceverà il tuo profilo.`,
  )
  coverLetter.value = ''
  open.value = false
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-4"
    @click.self="open = false"
    @keydown.esc="open = false"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-title"
      class="w-full max-w-lg space-y-5 rounded-xl bg-white p-6 shadow-xl"
    >
      <header>
        <h2 id="apply-title" class="text-lg font-semibold text-slate-900">Candidati</h2>
        <p class="text-sm text-slate-600">{{ job.title }} · {{ job.company.name }}</p>
      </header>

      <template v-if="candidate.profile?.cv">
        <div
          class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
          data-test="cv-to-send"
        >
          <p class="text-slate-500">Curriculum che verrà inviato</p>
          <p class="font-medium text-slate-900">{{ candidate.profile.cv.name }}</p>
        </div>

        <form class="space-y-5" novalidate @submit.prevent="send">
          <div class="space-y-1.5">
            <label for="cover_letter" class="block text-sm font-medium text-slate-700">
              Lettera di presentazione <span class="font-normal text-slate-500">(facoltativa)</span>
            </label>
            <textarea
              id="cover_letter"
              ref="textarea"
              v-model="coverLetter"
              rows="6"
              maxlength="3000"
              class="field"
              :class="{ 'field-invalid': errors.cover_letter }"
              placeholder="Perché sei la persona giusta per questa posizione?"
            />
            <p v-if="errors.cover_letter" class="text-xs text-red-600">
              {{ errors.cover_letter[0] }}
            </p>
          </div>

          <p v-if="errors.job_posting || errors.cv" class="text-sm text-red-600" role="alert">
            {{ (errors.job_posting ?? errors.cv)?.[0] }}
          </p>

          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary" @click="open = false">Annulla</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Invio…' : 'Invia candidatura' }}
            </button>
          </div>
        </form>
      </template>

      <template v-else>
        <p class="text-sm text-slate-600" data-test="cv-missing">
          Per candidarti devi prima caricare il tuo curriculum nel profilo.
        </p>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary" @click="open = false">Annulla</button>
          <RouterLink :to="{ name: 'candidate.profile' }" class="btn-primary">
            Vai al profilo
          </RouterLink>
        </div>
      </template>
    </div>
  </div>
</template>
