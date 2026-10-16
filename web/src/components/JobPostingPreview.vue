<script setup lang="ts">
import { computed } from 'vue'
import { CONTRACT_TYPES, WORK_MODES, type ContractType, type WorkMode } from '@/types/jobPosting'
import { useSkillsStore } from '@/stores/skills'
import { formatCurrency } from '@/utils/formatters'
import SkillBadges from './SkillBadges.vue'

const props = defineProps<{
  title: string
  description: string
  salary: number | string | null
  workMode: WorkMode | null
  contractType: ContractType | null
  skills: number[]
  company: string
}>()
const catalog = useSkillsStore()
const workLabel = computed(() => WORK_MODES.find((item) => item.value === props.workMode)?.label)
const contractLabel = computed(
  () => CONTRACT_TYPES.find((item) => item.value === props.contractType)?.label,
)
</script>

<template>
  <aside class="space-y-4 lg:sticky lg:top-6 lg:self-start" aria-label="Anteprima dell'offerta">
    <div>
      <h2 class="font-semibold text-slate-900">Anteprima in tempo reale</h2>
      <p class="text-sm text-slate-500">Controlla come si presenterà la tua offerta.</p>
    </div>
    <article class="space-y-5 rounded-xl border border-indigo-200 bg-white p-6 shadow-xs">
      <header>
        <p class="mb-2 text-xs font-semibold tracking-wide text-indigo-600 uppercase">Anteprima</p>
        <h3 class="text-xl font-bold wrap-break-word text-slate-900">
          {{ title || "Titolo dell'offerta" }}
        </h3>
        <p class="mt-1 text-sm text-slate-500">{{ company }}</p>
      </header>
      <dl class="space-y-3 rounded-lg bg-slate-50 p-4 text-sm">
        <div>
          <dt class="text-slate-500">RAL</dt>
          <dd class="font-semibold">
            {{ salary !== null && salary !== '' ? formatCurrency(salary) : 'Da specificare' }}
          </dd>
        </div>
        <div>
          <dt class="text-slate-500">Modalità di lavoro</dt>
          <dd>{{ workLabel || 'Da specificare' }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">Contratto</dt>
          <dd>{{ contractLabel || 'Da specificare' }}</dd>
        </div>
      </dl>
      <section v-if="skills.length">
        <h4 class="mb-2 font-semibold">Competenze richieste</h4>
        <SkillBadges :skills="catalog.byIds(skills)" />
      </section>
      <section>
        <h4 class="mb-2 font-semibold">Descrizione</h4>
        <p class="text-sm whitespace-pre-wrap wrap-break-word text-slate-600">
          {{ description || 'Descrivi attività, requisiti e benefit per i candidati.' }}
        </p>
      </section>
    </article>
  </aside>
</template>
