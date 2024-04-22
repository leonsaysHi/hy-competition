<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed, ref, watchEffect } from 'vue'
import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'
import useOptionsLib from '@/composable/useOptionsLib'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import ViewHero from '../components/layout/ViewHero.vue'

const route = useRoute()
const router = useRouter()
const { competitionId, phase } = route.params as { competitionId: string; phase: string }

const { competitionPhases } = useOptionsLib()

const { isReady, computedPhases } = useCompetition(competitionId)


const selectedPhaseIdx = ref<string | undefined>(phase || undefined)
const selectedGroupIdx = ref<string | undefined>('0')
const selectedPhase = computed<CompetitionPhaseComputed | undefined>(() =>
  Array.isArray(computedPhases?.value) && selectedPhaseIdx.value
    ? (computedPhases.value[Number(selectedPhaseIdx.value)] as CompetitionPhaseComputed)
    : undefined
)
const selectedGroup = computed<CompetitionGroupComputed | undefined>(() =>
  Array.isArray(selectedPhase.value?.groups) && selectedGroupIdx.value
    ? selectedPhase.value?.groups[Number(selectedGroupIdx.value)]
    : undefined
)
const phasesOptions = computed<Option[] | undefined>(() =>
  Array.isArray(computedPhases.value)
    ? computedPhases.value?.map(
        (row: CompetitionPhaseComputed, idx): Option => ({
          value: idx.toString(),
          text: competitionPhases.find((opt) => opt.value === row.type)?.text as string
        })
      )
    : undefined
)
watchEffect(() => {
  if (selectedPhaseIdx.value === undefined && competitionPhases.length >= 1) {
    selectedPhaseIdx.value = Array.isArray(phasesOptions.value)
      ? phasesOptions.value[phasesOptions.value.length - 1].value
      : undefined
    if (selectedPhaseIdx.value) {
      router.replace({
        ...route,
        params: { phase: selectedPhaseIdx.value }
      })
    }
  }
})
</script>
<template>
  <div>
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <ViewHero>
        <h1>Tabla y estadística</h1>
        <template #nav>
          <DropdownComp
            v-model="selectedPhaseIdx"
            :options="phasesOptions"
            variant="light"
            size="lg"
            class="fw-bold fz-5"
            :disabled="phasesOptions.length === 1"
          />
        </template>
      </ViewHero>
      
      <template v-if="selectedPhase && selectedGroup">
        <h2>Tabla</h2>
        <CompetitionStanding :value="selectedGroup.standing" />
        <h2>Líderes por categorías</h2>
        <CompetitionRanking :value="selectedGroup.ranking" :length="15" />
      </template>
    </template>
  </div>
</template>
