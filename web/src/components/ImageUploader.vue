<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { IMAGE_TYPES, validateImage } from '@/utils/files'
import AvatarImage from './AvatarImage.vue'

/** Uploads a company logo or a profile photo, checking it before sending. */
const props = withDefaults(
  defineProps<{
    name: string
    imageUrl: string | null
    kind?: 'logo' | 'photo'
    busy?: boolean
  }>(),
  { kind: 'logo', busy: false },
)

const emit = defineEmits<{ upload: [file: File]; remove: [] }>()

const input = useTemplateRef('input')
const error = ref<string | null>(null)

const labels = computed(() =>
  props.kind === 'photo'
    ? { subject: 'La foto', upload: 'Carica foto', change: 'Cambia foto', input: 'Foto profilo' }
    : {
        subject: 'Il logo',
        upload: 'Carica logo',
        change: 'Cambia logo',
        input: "Logo dell'azienda",
      },
)

function choose(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]

  // Clears the input so choosing the same file again still triggers "change".
  if (input.value) input.value.value = ''
  if (!file) return

  error.value = validateImage(file, labels.value.subject)
  if (!error.value) emit('upload', file)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-5">
    <AvatarImage :name="name" :image-url="imageUrl" size="lg" :round="kind === 'photo'" />

    <div class="space-y-2">
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn-secondary" :disabled="busy" @click="input?.click()">
          {{ imageUrl ? labels.change : labels.upload }}
        </button>
        <button
          v-if="imageUrl"
          type="button"
          class="btn-danger"
          :disabled="busy"
          data-test="remove-image"
          @click="emit('remove')"
        >
          Rimuovi
        </button>
      </div>
      <p v-if="error" class="text-xs text-red-600" role="alert" data-test="image-error">
        {{ error }}
      </p>
      <p v-else class="text-xs text-slate-500">JPG, PNG o WebP, massimo 1 MB.</p>
    </div>

    <input
      ref="input"
      type="file"
      class="sr-only"
      :accept="IMAGE_TYPES.join(',')"
      :aria-label="labels.input"
      data-test="image-input"
      @change="choose"
    />
  </div>
</template>
