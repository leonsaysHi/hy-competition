<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed, watchEffect } from 'vue'
import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'
import { useI18n } from 'vue-i18n'
import useOptionsLib from '@/composable/useOptionsLib'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import ViewHero from '../components/layout/ViewHero.vue'

const route = useRoute()
const router = useRouter()
const { competitionId, phase } = route.params as { competitionId: string; phase: string }

const { t } = useI18n()
const { competitionPhases } = useOptionsLib()

const { isReady, computedPhases } = useCompetition(competitionId)

const selectedPhaseIdx = computed({
  get () { 
    const { phase } = route.params
    return phase || '0' 
  },
  set (v) {
    router.replace({
      ...route,
      params: {
        phase: v,
        group: '0'
      }
    })
  }
})
const selectedGroupIdx = computed({
  get () { 
    const { group } = route.params
    return group || '0' 
  },
  set (v) {
    router.replace({
      ...route,
      params: {
        ...route.params,
        group: v
      }
    })
  }
})
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
const groupsOptions = computed<Option[] | undefined>(() =>
  Array.isArray(selectedPhase.value?.groups)
    ? selectedPhase.value?.groups.map(
        (row: CompetitionGroupComputed, idx): Option => ({
          value: idx.toString(),
          text: t('global.group') + ` ${idx + 1}`
        })
      )
    : undefined
)

watchEffect(() => {
  const hasPhases = Array.isArray(computedPhases?.value) && computedPhases?.value.length > 1
  const hasGroups = selectedPhase.value && selectedPhase.value.groups.length > 1
  const params = {} as { phase: string, group?: string }
  if (hasPhases && !phase) {
    const pIdx = computedPhases.value.length - 1
    params.phase = pIdx.toString()
    params.group = '0'
  }
  if (hasGroups && !group) {
    params.group = '0'
    params.phase = params.phase || '0'
  }
  if (params.phase) {
    router.replace({
      ...route,
        params
    })
  }
})
</script>
<template>
  <div>
    <template v-if="!isReady">
      <div class="py-5"><SpinnerComp /></div>
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
          <template v-if="groupsOptions.length > 1">
            <RadioGroupComp 
              v-model="selectedGroupIdx" 
              :options="groupsOptions" 
              buttons 
              @change="handleChangeGroup" 
            />
          </template>
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
