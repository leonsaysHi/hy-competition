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
  CompetitionGroupComputed,
  CompetitionPhaseComputed,
  CompetitionRanking
} from '@/types/computed'
import type { StatKey, Stats, PlayerRankingStats } from '@/types/stats'
const route = useRoute()
const { competitionId, playerId } = route.params

const { getPlayerName } = useLibs()
const { playerRankingKeys } = useOptionsLib()
const {
  isReady: isCompetitionReady,
  getPlayerCompetitionTeam,
  row: competition,
  games,
  competitionClass
} = useCompetition(competitionId)

const competitionTeam = computed<CompetitionTeam | undefined>(() =>
  getPlayerCompetitionTeam(playerId)
)
const teamId = computed<TeamId | undefined>(() => competitionTeam.value?.id)
const competitionPlayer = computed(() =>
  competitionTeam.value?.players.find((player: CompetitionPlayer) => player.id === playerId)
)
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
const statsItems = computed<TableItem[]>(() => {
  const emptyRank: PlayerRankingStats = trackedPlayerRankingKeys.value.reduce(
    (acc: Stats, opt: Option) => ({ ...acc, [opt.value]: 0 }),
    {} as Stats
  )
  // accumulate phases rankings:
  const totalRanks: PlayerRankingStats = Array.isArray(competitionClass.value?.computedPhases)
    ? competitionClass.value.computedPhases.reduce(
        (totalRanks: PlayerRankingStats, phase: CompetitionPhaseComputed): PlayerRankingStats => {
          if (Array.isArray(phase.groups)) {
            const group = phase.groups.find((group: CompetitionGroupComputed) => {
              return (
                Array.isArray(group?.ranking) &&
                group.ranking.findIndex((rank: CompetitionRanking) => rank.id === playerId) > -1
              )
            })
            if (Array.isArray(group?.ranking)) {
              const stats: CompetitionRanking | undefined = group?.ranking.find(
                (rank: CompetitionRanking) => rank.id === playerId
              )
              if (stats) {
                playerRankingKeys.forEach((opt: Option) => {
                  const key = opt.value as StatKey
                  if (key in stats) {
                    totalRanks[key] = (totalRanks[key] || 0) + stats[key]
                  }
                })
                totalRanks.gp += stats.gp
              }
            }
          }
          return totalRanks
        },
        emptyRank
      )
    : emptyRank
  return [totalRanks] as unknown as TableItem
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
          <div class="display-1 text-body-secondary lh-1">
            #<strong>{{ competitionPlayer?.number }}</strong>
          </div>
          <h1 class="display-6 fw-bold">{{ getPlayerName(playerId) }}</h1>
        </div>
        <div class="ms-auto align-self-end">
          <div class="d-flex flex-column align-items-center gap-2">
            <ImageComp :src="competitionTeam?.sponsor" :width="100" />
          </div>
        </div>
      </div>
      <TableComp :fields="statsFields" :items="statsItems"> </TableComp>
      <hr />
      <PlayerGamesList :items="playerGames" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
