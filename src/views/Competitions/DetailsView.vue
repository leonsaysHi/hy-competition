<script lang="ts" setup>
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed, ref, watch } from 'vue'
import useOptionsLib from '@/composable/useOptionsLib'
import PhaseGroupSelect from '@/components/competitions/PhaseGroupSelect.vue'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import GamesList from '@/components/games/GamesList.vue'
import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'
import useCompetitionPhasesGroups from '@/composable/useCompetitionPhasesGroups'
import BracketView from '@/components/bracket/BracketView.vue'

import GamesClass from '@/models/Games'
import type { CompetitionTeam } from '@/types/teams'

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }

const { isReady, row, getCompetitionTeam } = useCompetition(competitionId)

const {
  selectedPhaseIdx,
  selectedPhase,
  selectedGroupIdx,
  selectedGroup,
  
} = useCompetitionPhasesGroups()

const { t } = useI18n()
const { getGender, getCategory } = useOptionsLib()

type GamesListValue = 'prev' | 'next' | 'live'
interface GamesListOption {
  text: String
  value: GamesListValue
  disabled: Boolean
}
const currentGamesView = ref<GamesListValue>('prev')

const selectedGames = computed<GameComputedClass[]>(() => {
  return row.value ? 
    new GamesClass(row.value, row.value?.games)
      .phase(Number(selectedPhaseIdx.value))
      .group(Number(selectedGroupIdx.value))
      .finished(true)
      .live(false)
      .getComputed()
    : []
})

const standingTeams = computed<CompetitionTeam[]>(() => {
  // :/
  return selectedGroup.value?.standing
    .map((row) => getCompetitionTeam(row.teamId))
})

const prevGamesList = computed<GameComputedClass[]>(() => {
  const result = row.value ? 
    new GamesClass(row.value, row.value?.games)
      .phase(Number(selectedPhaseIdx.value))
      .group(Number(selectedGroupIdx.value))
      .finished(true)
      .live(false)
      .getComputed()
    : []
  result.reverse()
  const teamsLength = Array.isArray(selectedGroup.value?.standing) ? Math.round(selectedGroup.value.standing.length * .5) : 4
  return Array.isArray(selectedGroup.value?.standing)
    ? result.slice(0, teamsLength) 
    : result
})

const liveGamesList = computed<GameComputedClass[]>(() => {
  const result = row.value 
    ? new GamesClass(row.value, row.value?.games)
      .phase(Number(selectedPhaseIdx.value))
      .group(Number(selectedGroupIdx.value))
      .finished(false)
      .live(true)
      .getComputed()
    : []
  return result
})

const nextGamesList = computed<GameComputedClass[]>(() => {
  const result = row.value 
    ? new GamesClass(row.value, row.value.games)
      .phase(Number(selectedPhaseIdx.value))
      .group(Number(selectedGroupIdx.value))
      .finished(false)
      .live(false)
      .getComputed()
    : []
  const teamsLength = Array.isArray(selectedGroup.value?.standing) ? Math.round(selectedGroup.value.standing.length * .5) : 4
  return Array.isArray(selectedGroup.value?.standing)
    ? result.slice(0, teamsLength) 
    : result
})

const gamesListOptions = computed<GamesListOption[]>(() => {
  return [
    {
      text: t('global.gameDetails.live'),
      value: 'live' as GamesListValue,
      disabled: !liveGamesList.value.length
    },
    {
      text: t('global.previous', 2),
      value: 'prev' as GamesListValue,
      disabled: !prevGamesList.value.length
    },
    {
      text: t('global.upcoming', 2),
      value: 'next' as GamesListValue,
      disabled: !nextGamesList.value.length
    }
  ]
})

const gamesList = computed<GameComputedClass[]>(() => {
  const games = row.value ? 
    new GamesClass(row.value, row.value?.games)
      .phase(Number(selectedPhaseIdx.value))
      .group(Number(selectedGroupIdx.value))
    : undefined
  if (!games) { 
    return []
  }
  const result = currentGamesView.value === 'prev'
      ? prevGamesList.value
      : currentGamesView.value === 'live'
        ? liveGamesList.value
        : nextGamesList.value

  return result
})


watch(
  () => gamesListOptions.value,
  (val: GamesListOption[]) => {
    const optIdx = val.findIndex((opt: GamesListOption) => !opt.disabled)
    if (optIdx > -1) {
      currentGamesView.value = val[optIdx].value as 'prev' | 'next' | 'live'
    }
  }
)
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
    <template v-else>
      <PhaseGroupSelect class="mb-3" />
      <hr />
      <template v-if="selectedPhase && selectedGroup">
        <template v-if="selectedPhase.type === 'playoffs'">
          <h3>{{ t('global.playoffs') }}</h3>
          <BracketView :games="selectedGames" :teams="standingTeams" />
        </template>
        <template v-else>
          <h3>{{ t('global.standing') }}</h3>
          <CompetitionStanding :games="selectedGames" :teams="standingTeams" />
        </template>
        <div class="d-flex align-items-end justify-content-between">
          <h3>{{ t('global.game', 2) }}</h3>
          <ul class="nav nav-underline justify-content-end">
            <template v-for="opt in gamesListOptions" :key="opt.value">
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
        <GamesList class="mb-3" :items="gamesList" />
        <div class="d-flex gap-3 justify-content-between">
          <h3>{{ t('global.ranking') }}</h3>
        </div>
        <CompetitionRanking :games="selectedGames" :limit="15" show-avg-ui />
      </template>
    </template>
  </div>
</template>
