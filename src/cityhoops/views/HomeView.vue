<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed, watchEffect } from 'vue'
import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'
import useOptionsLib from '@/composable/useOptionsLib'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import GamesList from '@/components/games/GamesList.vue'
import { compareAsc } from 'date-fns'
import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'
import ButtonComp from '@/components/ButtonComp.vue'
import ViewHero from '../components/layout/ViewHero.vue'

const route = useRoute()
const router = useRouter()
const { competitionId, phase, group } = route.params as { competitionId: string; phase: string, group: string }

const { t } = useI18n()
const { competitionPhases, getGender, getCategory } = useOptionsLib()

const { isReady, row, computedPhases } = useCompetition(competitionId)

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

const nextGames = computed<GameComputedClass[]>(() => {
  const result = Array.isArray(selectedGroup.value?.games)
    ? selectedGroup.value.games.filter((game: GameComputedClass) => {
        return !game.isFinished || game.isLive
      })
    : []
  result.sort((a: GameComputedClass, b: GameComputedClass) => 
    compareAsc(a.row.datetime, b.row.datetime)
  )
  return result.slice(
    0,
    selectedGroup.value?.standing 
      ? Math.max(
          Math.round(selectedGroup.value?.standing.length * 0.5),
          Math.min(4, selectedGroup.value?.standing.length)
        )
      : 5
  )
})
</script>
<template>
  <div>
    <template v-if="!isReady">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else-if="!phasesOptions?.length">
      <p>Error: No phase.</p>
      {{ computedPhases }}
    </template>
    <template v-else>
      <ViewHero>
          <h1>{{ row?.title }}</h1>
          <div class="d-flex gap-3 align-items-start">
            <p>{{ row?.date }}</p>
            <p>{{ getGender(row?.gender)?.long }}</p>
            <p>{{ getCategory(row?.category)?.text }}</p>
          </div>
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
        <h2>{{ t('global.game', 2) }}</h2>
        <GamesList class="mb-3" :items="nextGames" />
        <div class="mb-3 d-flex justify-content-center">
          <RouterLink
            class="btn btn-primary btn-lg text-white"
            :to="{ name: 'competition-games', params: { competitionId} }"
            >Ver Resultados</RouterLink
          >
        </div>
        <hr />
        <h2>Tabla</h2>
        <CompetitionStanding :value="selectedGroup.standing" :length="7" />
        <div class="mb-3 d-flex justify-content-center">
          <ButtonComp
            variant="primary"
            class="text-white"
            size="lg"
            :to="{ name: 'competition-standing' }"
            >Ver tabla completa</ButtonComp
          >
        </div>
      </template>
    </template>
  </div>
</template>
