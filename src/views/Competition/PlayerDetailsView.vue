<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
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
import type { CompetitionRanking } from '@/models/CompetitionComputed'
import type { PlayerStatKey, PlayerStats } from '@/types/stats'
import { getAvg } from '@/utils/maths'
const route = useRoute()
const { competitionId, playerId } = route.params as { competitionId: string; playerId: string }

const { getPlayerName } = useLibs()
const { playerRankingKeys, statsKeys } = useOptionsLib()
const {
  isReady: isCompetitionReady,
  getCompetitionPlayer,
  getPlayerCompetitionTeam,
  row: competition,
  games,
  competitionRankings
} = useCompetition(competitionId)

const competitionTeam = computed<CompetitionTeam | undefined>(() =>
  getPlayerCompetitionTeam(playerId)
)
const competitionPlayer = computed<CompetitionPlayer | undefined>(() =>
  getCompetitionPlayer(playerId)
)
const playerGames = computed<Game[]>(() => {
  return Array.isArray(games.value) && competitionTeam.value?.id
    ? games.value.filter((game: Game) => {
        return Object.keys(game.boxscore).includes(playerId) && !game.boxscore[playerId].dnp
      })
    : []
})

const trackedPlayerRankingKeys = computed<Option[]>(() =>
  playerRankingKeys.filter((opt: Option) => competition.value?.trackedStats.includes(opt.value))
)
const statsFields = computed<TableField[]>(() =>
  trackedPlayerRankingKeys.value.map((opt: Option) => ({
    key: opt.value,
    label: opt.text,
    thClass: 'text-end',
    tdClass: 'text-end'
  }))
)
const competitionComputed = computed<CompetitionRanking | undefined>(() => {
  return competitionRankings.value?.find((rank: CompetitionRanking) => rank.playerId === playerId)
})
const statsItem = computed<TableItem[]>(() => {
  const row = competitionComputed.value
  return competitionComputed.value 
  ? [
      {
        ...row,
        ...statsKeys
          .filter((opt: Option) => competition.value?.trackedStats.includes(opt.value))
          .reduce((result:TableItem, opt:Option) => {
            const key = opt.value as PlayerStatKey
            result[key] = getAvg(row[key], row.gp)
            return result
          }, {})
      }
  ] 
  : []
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
          <div class="display-1 text-body-secondary lh-1 jersey-number">
            #<strong>{{ competitionPlayer?.number }}</strong>
          </div>
          <h1 class="display-6 fw-bold jersey-name">{{ getPlayerName(playerId) }}</h1>
        </div>
        <div class="ms-auto align-self-end">
          <div class="d-flex flex-column align-items-center gap-2">
            <ImageComp :src="competitionTeam?.sponsor" :width="100" />
          </div>
        </div>
      </div>
      <TableComp :fields="statsFields" :items="statsItem"></TableComp>
      <hr />
      <PlayerGamesList :items="playerGames" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
