<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import StatsTableComp from '@/components/StatsTableComp.vue'
import type { CompetitionTeam } from '@/types/teams'
import type { CompetitionPlayer } from '@/types/players'
import useLibs from '@/composable/useLibs'

import TeamLogo from '@/components/teams/TeamLogo.vue'
import ImageComp from '@/components/ImageComp.vue'
import useCompetition from '@/composable/useCompetition'
import PlayerGamesList from '@/components/games/PlayerGamesList.vue'
import type { Game } from '@/types/games'
import type { Option } from '@/types/comp-fields'
import useOptionsLib from '@/composable/useOptionsLib'
import type { TableField, TableItem } from '@/types/comp-table'
import type { CompetitionPlayerStats, CompetitionRanking } from '@/types/computed'
import type { PlayerStatLineKey } from '@/types/stats'

import { useI18n } from 'vue-i18n'
import GameComputedClass from '@/models/GameComputed'
import CheckComp from '@/components/CheckComp.vue'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import type { Phase } from '@/types/competitions'
import GamesClass from '@/models/Games'
import useStats from '@/composable/useStats'
const { t } = useI18n()
const route = useRoute()
const { competitionId, playerId } = route.params as { competitionId: string; playerId: string }

const { getPlayerName } = useLibs()
const { getPlayersStatsForGames } = useStats()
const {
  isReady: isCompetitionReady,
  getCompetitionPlayer,
  getPlayerCompetitionTeam,
  row,
  teams,
  games,
  trackedPlayerRankingKeys
} = useCompetition(competitionId)

const competitionTeam = computed<CompetitionTeam | undefined>(() =>
  getPlayerCompetitionTeam(playerId)
)
const competitionPlayer = computed<CompetitionPlayer | undefined>(() =>
  getCompetitionPlayer(playerId)
)

const showAvg = ref<boolean>(true)
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

const gamesList = computed(() => row.value && Array.isArray(games.value)
  ? new GamesClass(row.value, games.value)
    .phase(selectedPhase.value)
    .player(playerId)
    .finished(true)
    .live(false)
    .getComputed()
  : []
)


const statsFields = computed<TableField[]>(() => {
  const fields = trackedPlayerRankingKeys.value.map(
    (opt: Option): TableField => ({
      key: opt.value,
      label: opt.text,
      sortable: true,
      thClass: 'text-end',
      tdClass: 'text-end'
    })
  )
  return fields
})

const statsItem = computed<CompetitionPlayerStats[]>(() => {
  return getPlayersStatsForGames(teams.value, gamesList.value)
    .filter((stats: CompetitionPlayerStats) => stats.playerId === playerId)
})
</script>
<template>
  <div>
    <template v-if="!isCompetitionReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="mt-4 pb-3 d-flex gap-3">
        <div>
          <TeamLogo :team-id="competitionTeam?.id" :size="150" />
        </div>
        <div>
          <div class="display-1 text-body-secondary lh-1 font-number">
            #<strong>{{ competitionPlayer?.number }}</strong>
          </div>
          <h1 class="display-6 fw-bold font-name">{{ getPlayerName(playerId) }}</h1>
        </div>
        <div class="ms-auto align-self-end">
          <div class="d-flex flex-column align-items-center gap-2">
            <ImageComp :src="competitionTeam?.sponsor" :width="100" />
          </div>
        </div>
      </div>
      <StatsTableComp 
        :fields="statsFields" 
        :items="statsItem" 
        :show-avg="showAvg"
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
        <template #actions>
          <div class="py-2">
            <CheckComp v-model="showAvg" switch button-size="sm">{{ $t('options.stats.showavg') }}</CheckComp>
          </div>
        </template>
      </StatsTableComp>
      <hr />
      <PlayerGamesList :items="gamesList" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
