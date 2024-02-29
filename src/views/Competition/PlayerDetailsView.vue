<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import type { CompetitionTeam, TeamId } from '@/types/teams'
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
import type {
PlayerCompetitionComputed
} from '@/types/computed'
const route = useRoute()
const { competitionId, playerId } = route.params

const { getPlayerName } = useLibs()
const { playerRankingKeys } = useOptionsLib()
const {
  isReady: isCompetitionReady,
  getCompetitionTeam,
  getCompetitionPlayer,
  row: competition,
  games,
  competitionClass
} = useCompetition(competitionId)

const teamId = computed<TeamId>(() => competitionComputed.value.teamId as TeamId)
const competitionTeam = computed<CompetitionTeam | undefined>(() =>
  getCompetitionTeam(teamId.value)
)
const competitionPlayer = computed<CompetitionPlayer>(() => getCompetitionPlayer(playerId) as CompetitionPlayer)
const playerGames = computed<Game[]>(() => {
  return Array.isArray(games.value) && teamId.value
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
    label: opt.text
  }))
)
const competitionComputed = computed<PlayerCompetitionComputed>(() => {
  return competitionClass.value?.competitionRankings
    .find((rank:PlayerCompetitionComputed) => rank.id === playerId) as PlayerCompetitionComputed
})
const statsItem = computed<TableItem[]>(() => {
  return [ competitionComputed.value as unknown as TableItem ]
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
          <TeamLogo :team-id="competitionComputed.teamId" :size="150" />
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
      <TableComp :fields="statsFields" :items="statsItem"> </TableComp>
      <hr />
      <PlayerGamesList :items="playerGames" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
