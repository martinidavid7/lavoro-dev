<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { LOGO_TYPES, validateLogo } from '@/utils/company'
import CompanyLogo from './CompanyLogo.vue'

defineProps<{
  name: string
  logoUrl: string | null
  busy?: boolean
}>()

const emit = defineEmits<{ upload: [file: File]; remove: [] }>()

const input = useTemplateRef('input')
const error = ref<string | null>(null)

function choose(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]

  // Clears the input so choosing the same file again still triggers "change".
  if (input.value) input.value.value = ''
  if (!file) return

  error.value = validateLogo(file)
  if (!error.value) emit('upload', file)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-5">
    <CompanyLogo :name="name" :logo-url="logoUrl" size="lg" />

    <div class="space-y-2">
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn-secondary" :disabled="busy" @click="input?.click()">
          {{ logoUrl ? 'Cambia logo' : 'Carica logo' }}
        </button>
        <button
          v-if="logoUrl"
          type="button"
          class="btn-danger"
          :disabled="busy"
          data-test="remove-logo"
          @click="emit('remove')"
        >
          Rimuovi
        </button>
      </div>
      <p v-if="error" class="text-xs text-red-600" role="alert" data-test="logo-error">
        {{ error }}
      </p>
      <p v-else class="text-xs text-slate-500">JPG, PNG o WebP, massimo 1 MB.</p>
    </div>

    <input
      ref="input"
      type="file"
      class="sr-only"
      :accept="LOGO_TYPES.join(',')"
      aria-label="Logo dell'azienda"
      data-test="logo-input"
      @change="choose"
    />
  </div>
</template>
