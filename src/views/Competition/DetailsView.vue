<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed, ref, watch, watchEffect } from 'vue'
import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import GamesList from '@/components/games/GamesList.vue'
import { compareAsc } from 'date-fns'
import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'

const route = useRoute()
const router = useRouter()
const { competitionId, phase, group } = route.params as { competitionId: string; phase: string, group: string }

const { t } = useI18n()
const { competitionPhases, getGender, getCategory } = useOptionsLib()

const { isReady, row, computedPhases, competitionRankings } = useCompetition(competitionId)

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

const gamesViewOptions = computed<Option[]>(() => {
  return [
    { 
      text: t('global.gameDetails.live'), 
      value: 'live',
      disabled: !selectedGroup.value || !selectedGroup.value?.games.some((game: GameComputedClass) => game.isLive)
    },
    { 
      text: t('global.previous', 2), 
      value: 'prev',
      disabled: !selectedGroup.value || !selectedGroup.value?.games.some((game: GameComputedClass) => game.isFinished && !game.isLive)
    },
    { 
      text: t('global.upcoming', 2), 
      value: 'next',
      disabled: !selectedGroup.value || !selectedGroup.value?.games.some((game: GameComputedClass) => !game.isFinished && !game.isLive)
    }
  ]
})

const currentGamesView = ref<'prev' | 'next' | 'live'>('prev')

watch(
  () => gamesViewOptions.value,
  (val: Option[]) => {
    const optIdx = val.findIndex((opt: Option) => !opt.disabled)
    if (optIdx > -1) {
      currentGamesView.value = val[optIdx].value as ('prev' | 'next' | 'live')
    }
  }
)

const groupGames = computed<GameComputedClass[]>(() => {
  const result = Array.isArray(selectedGroup.value?.games) 
    ? selectedGroup.value.games.filter((game: GameComputedClass) => {
      return currentGamesView.value === 'prev' 
        ? game.isFinished && !game.isLive 
        : currentGamesView.value === 'next' 
          ? !game.isFinished && !game.isLive
          : !game.isFinished && game.isLive
    }) 
    : []
  result.sort((a: GameComputedClass, b: GameComputedClass) =>
    currentGamesView.value === 'prev'
      ? compareAsc(b.row.datetime, a.row.datetime)
      : compareAsc(a.row.datetime, b.row.datetime)
  )
  return result.slice(
    0,
    Math.max(
      Math.round(selectedGroup.value.standing.length * 0.5),
      Math.min(4, selectedGroup.value.standing.length)
    )
  )
})
</script>
<template>
  <div>
    <h1>{{ row?.title }}</h1>
    <div class="d-flex gap-3 align-items-start">
      <p>{{ row?.date }}</p>
      <p>{{ getGender(row?.gender)?.long }}</p>
      <p>{{ getCategory(row?.category)?.text }}</p>
    </div>

    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else-if="!phasesOptions?.length || !groupsOptions?.length">
      <p>Error: No phase.</p>
    </template>
    <template v-else>
      <div class="mb-3 hstack gap-3">
        <DropdownComp
          v-model="selectedPhaseIdx"
          :options="phasesOptions"
          variant="light"
          size="lg"
          class="fw-bold fz-5"
          :disabled="phasesOptions.length === 1"
          @change="handleChangePhase"
        />
        <template v-if="groupsOptions.length > 1">
          <RadioGroupComp 
            v-model="selectedGroupIdx" 
            :options="groupsOptions" 
            buttons 
            @change="handleChangeGroup" 
          />
        </template>
      </div>
      <hr />
      <template v-if="selectedPhase && selectedGroup">
        <h3>{{ t('global.standing') }}</h3>
        <CompetitionStanding :value="selectedGroup.standing" />
        <div class="d-flex align-items-end justify-content-between">
          <h3>{{ t('global.game', 2) }}</h3>
          <ul class="nav nav-underline justify-content-end">
            <template v-for="opt in gamesViewOptions" :key="opt.value">
              <li class="nav-item">
                <a
                  class="nav-link"
                  :class="[currentGamesView === opt.value && 'active', opt.disabled && 'disabled']"
                  :aria-current="currentGamesView === opt.value ? 'page' : false"
                  @click="currentGamesView = opt.value"
                  >{{ opt.text }}</a
                >
              </li>
            </template>
          </ul>
        </div>
        <GamesList class="mb-3" :items="groupGames" />
        <h3>{{ t('global.ranking') }}</h3>
        <CompetitionRanking :value="selectedGroup.ranking" :length="15" />
      </template>
    </template>
  </div>
</template>
