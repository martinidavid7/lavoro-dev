<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue'
import { useSkillsStore } from '@/stores/skills'

/**
 * Picks skills from the catalog: type to search, then click or press Enter.
 * The selected skills are shown as chips; Backspace on the empty field removes the last one.
 */
const props = withDefaults(
  defineProps<{
    id: string
    max?: number
    invalid?: boolean
    placeholder?: string
  }>(),
  { max: 30, invalid: false, placeholder: 'Cerca una competenza: Vue.js, PHP, Docker…' },
)

const selected = defineModel<number[]>({ required: true })

const skills = useSkillsStore()
const query = ref('')
const open = ref(false)
const active = ref(0)
const listboxId = useId()

onMounted(() => skills.ensureLoaded().catch(() => undefined))

const selectedSkills = computed(() =>
  selected.value
    .map((id) => skills.items.find((skill) => skill.id === id))
    .filter((skill) => skill !== undefined),
)

const isFull = computed(() => selected.value.length >= props.max)

/** Case and accent insensitive: "vue" finds "Vue.js", "c#" finds "C#". */
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

const options = computed(() => {
  const term = normalize(query.value.trim())

  return skills.items
    .filter((skill) => !selected.value.includes(skill.id))
    .filter((skill) => !term || normalize(skill.name).includes(term))
    .slice(0, 8)
})

const showList = computed(() => open.value && !isFull.value && options.value.length > 0)

function add(id: number) {
  if (isFull.value || selected.value.includes(id)) return

  selected.value = [...selected.value, id]
  query.value = ''
  active.value = 0
}

function remove(id: number) {
  selected.value = selected.value.filter((selectedId) => selectedId !== id)
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      open.value = true
      active.value = Math.min(active.value + 1, options.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      active.value = Math.max(active.value - 1, 0)
      break
    case 'Enter': {
      const option = options.value[active.value]
      if (showList.value && option) {
        event.preventDefault()
        add(option.id)
      }
      break
    }
    case 'Escape':
      open.value = false
      break
    case 'Backspace': {
      const last = selected.value[selected.value.length - 1]
      if (query.value === '' && last !== undefined) remove(last)
      break
    }
  }
}
</script>

<template>
  <div class="relative">
    <div
      class="field flex flex-wrap items-center gap-1.5 py-1.5"
      :class="{ 'field-invalid': invalid }"
    >
      <span
        v-for="skill in selectedSkills"
        :key="skill.id"
        class="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-0.5 pr-1 pl-2.5 text-xs font-medium text-indigo-700"
        data-test="selected-skill"
      >
        {{ skill.name }}
        <button
          type="button"
          class="grid size-4 place-items-center rounded-full hover:bg-indigo-100"
          :aria-label="`Rimuovi ${skill.name}`"
          @click="remove(skill.id)"
        >
          ×
        </button>
      </span>

      <input
        :id="id"
        v-model="query"
        type="text"
        role="combobox"
        autocomplete="off"
        class="min-w-40 flex-1 border-0 bg-transparent p-1 text-sm outline-none placeholder:text-slate-400"
        :placeholder="isFull ? `Massimo ${max} competenze` : placeholder"
        :disabled="isFull"
        :aria-expanded="showList"
        :aria-controls="listboxId"
        :aria-activedescendant="showList ? `${listboxId}-${active}` : undefined"
        :aria-invalid="invalid"
        aria-autocomplete="list"
        data-test="skill-search"
        @focus="open = true"
        @blur="open = false"
        @input="((open = true), (active = 0))"
        @keydown="onKeydown"
      />
    </div>

    <ul
      v-show="showList"
      :id="listboxId"
      role="listbox"
      class="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
    >
      <li
        v-for="(option, index) in options"
        :id="`${listboxId}-${index}`"
        :key="option.id"
        role="option"
        :aria-selected="index === active"
        class="cursor-pointer px-3 py-2"
        :class="index === active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'"
        data-test="skill-option"
        @mousedown.prevent="add(option.id)"
        @mouseenter="active = index"
      >
        {{ option.name }}
      </li>
    </ul>
  </div>
</template>
