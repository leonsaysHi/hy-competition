<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import ImageComp from '@/components/ImageComp.vue'
import type { Game } from '@/types/games'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import GamesList from '@/components/games/GamesList.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import type { CompetitionStanding } from '@/types/computed'
import useOptionsLib from '@/composable/useOptionsLib'
import type { TableField, TableItem } from '@/types/comp-table'
import type { Option } from '@/types/comp-fields'
import LastGames from '@/components/games/LastGames.vue'


import { useI18n } from 'vue-i18n'
import GameComputedClass from '@/models/GameComputed'

import type { Phase } from '@/types/competitions'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import type { CompetitionTeam } from '@/types/team'
import { getCompetitionStanding } from '@/utils/stats/basketball'
const { t } = useI18n()
const route = useRoute()
const { competitionId, teamId } = route.params as { competitionId: string; teamId: string }

const { getTeamName } = useLibs()
const { teamStandingKeys } = useOptionsLib()
const { isReady, row, games, teams, filterGames } =
  useCompetition(competitionId)

  const competitionComputed = computed<CompetitionStanding | undefined>(() => {
  const standings = getCompetitionStanding(
    teams.value, 
    filterGames({
      teamId,
      isFinished: true,
      isLive: false
    })
  )
  return standings.find(
    (row: CompetitionStanding) => row.teamId === teamId
  )
})
const statsItem = computed<TableItem[]>(() => {
  return competitionComputed.value ? [competitionComputed.value as unknown as TableItem] : []
})


const competitionTeam = computed(() => {
  return teams.value?.find((team: CompetitionTeam) => team.id === teamId)
})
const teamGames = computed<GameComputedClass[]>(() =>
  Array.isArray(games.value)
    ? games.value
        .filter((game: Game) => game.teams.includes(teamId) && game.isFinished)
        .map((game: Game) => new GameComputedClass(competitionId, game))
        .reverse()
    : []
)

const selectedPhase = ref<undefined | number>(undefined)
const phasesOptions = computed(() => {
  return Array.isArray(row.value?.phases) 
    ? [
        {
          text: t('options.phases.overall'),
          value: undefined
        },
        ...row.value.phases
          .map((phase: Phase, idx: number) => ({
            text: phase.title,
            value: idx
          }))
    ]
    : []
})
const rankingGames = computed<GameComputedClass[]>(() => {
  return row.value 
    ? filterGames({
      isFinished: true,
      isLive: false
    })
    : []
})

const statsFields: TableField[] = [
  ...teamStandingKeys.map(
    (opt: Option): TableField => ({
      key: opt.value,
      label: opt.text,
      thClass: 'text-center',
      tdClass: 'text-center'
    })
  ),
  {
    label: t('options.standingStats.text.hist'),
    key: 'hist',
    thClass: 'text-center',
    tdClass: 'text-center'
  }
]

// games list
type GamesListValue = 'prev' | 'next' | 'live'
interface GamesListOption {
  text: String
  value: GamesListValue
  disabled: Boolean
}
const currentGamesView = ref<GamesListValue>('prev')

const prevGamesList = computed<GameComputedClass[]>(() => {
  const result = filterGames({
    teamId,
    isFinished: true,
    isLive: false
  })
  return result
})

const liveGamesList = computed<GameComputedClass[]>(() => {
  const result = filterGames({
    teamId,
    isFinished: false,
    isLive: true
  })
  return result
})

const nextGamesList = computed<GameComputedClass[]>(() => {
  const result = filterGames({
    teamId,
    isFinished: false,
    isLive: false
  })
  result.reverse()
  return result
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
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="position-relative mt-4 pb-3 d-flex flex-column align-items-center">
        <div class="position-absolute top-0 end-0">
          <ImageComp :src="competitionTeam?.sponsor" :width="100" />
        </div>
        <TeamLogo :team-id="teamId" :size="150" />
        <div class="display-3 fw-bold font-team">{{ getTeamName(teamId) }}</div>
      </div>
      <TableComp :fields="statsFields" :items="statsItem">
        <template #hist="{ value }">
          <LastGames :items="value" :length="5" />
        </template>
      </TableComp>
      <h3 class="mt-3">{{ t('global.ranking') }}</h3>
      <CompetitionRanking 
        :games="rankingGames" 
        :team-id="teamId" 
      >
        <template #filters>
          <RadioGroupComp 
            v-model="selectedPhase" 
            :options="phasesOptions" 
            button-variant="light"
            button-variant-active="primary"
            size="sm" 
            buttons 
          />
        </template>
      </CompetitionRanking>
      <h3 class="mt-3">{{ t('global.game', 2) }}</h3>
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
      <GamesList :items="gamesList" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
