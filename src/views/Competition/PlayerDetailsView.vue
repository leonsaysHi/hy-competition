<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer } from '@/types/players'
import useLibs from '@/composable/useLibs'

import TeamLogo from '@/components/teams/TeamLogo.vue'
import ImageComp from '@/components/ImageComp.vue'
import useCompetitionComputed from '@/composable/useCompetitionComputed'
import PlayerGamesList from '@/components/games/PlayerGamesList.vue'
import type { Game } from '@/types/games'
import type { Option } from '@/types/comp-fields'
import useOptionsLib from '@/composable/useOptionsLib'
import type { TableField, TableItem } from '@/types/comp-table'
import type {
  CompetitionGroupComputed,
  CompetitionPhaseComputed,
  CompetitionRanking,
  PlayerRankTotals
} from '@/types/computed'
import type { StatKey, Stats } from '@/types/stats'
const route = useRoute()
const { competitionId, playerId } = route.params

const { getPlayerName, getTeamName } = useLibs()
const { statsKeys } = useOptionsLib()
const { isReady: isCompetitionReady, row: competition } = useCompetition(competitionId)
const {
  isReady: isComputedCompetitionReady,
  games,
  computedRow
} = useCompetitionComputed(competitionId)

const competitionTeam = computed<CompetitionTeam | undefined>(
  () =>
    competition.value?.teams?.find((team: CompetitionTeam) =>
      team.players.findIndex((player: CompetitionPlayer) => player.id === playerId)
    ) as CompetitionTeam
)
const teamId = computed<TeamId | undefined>(() => competitionTeam.value?.id)
const competitionPlayer = computed(() =>
  competitionTeam.value?.players.find((player: CompetitionPlayer) => player.id === playerId)
)
const playerGames = computed<Game[]>(() => {
  return Array.isArray(games.value) && teamId.value
    ? games.value.filter((game: Game) => {
        return Object.keys(game.boxscore).includes(playerId)
      })
    : []
})

const statsFields: TableField[] = [
  { key: 'gp', label: 'GP' },
  ...statsKeys.map((opt: Option) => ({
    key: opt.value,
    label: opt.text
  }))
]
const statsItems = computed<TableItem[]>(() => {
  const emptyStats = statsKeys.reduce(
    (acc: Stats, opt: Option) => ({ ...acc, [opt.value]: 0 }),
    {} as Stats
  )
  const emptyRank: PlayerRankTotals = { gp: 0, awards: [], ...emptyStats }
  const totalRanks: PlayerRankTotals = Array.isArray(computedRow.value?.phases)
    ? computedRow.value?.phases.reduce(
        (totalRanks: PlayerRankTotals, phase: CompetitionPhaseComputed): PlayerRankTotals => {
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
                statsKeys.forEach((opt: Option) => {
                  const key = opt.value as StatKey
                  if (key in stats) {
                    totalRanks[key] = (totalRanks[key] || 0) + stats[key]
                  }
                })
                totalRanks.gp += stats.gp
                totalRanks.awards.push(...stats.awards)
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
    <template v-if="!isCompetitionReady || !isComputedCompetitionReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="mt-4 pb-3 d-flex justify-content-between gap-3">
        <div>
          <div class="display-1 text-body-secondary">
            #<strong>{{ competitionPlayer?.number }}</strong>
          </div>
          <h1 class="display-6 fw-bold">{{ getPlayerName(playerId) }}</h1>
          <h5>{{ getTeamName(competitionTeam?.id) }}</h5>
        </div>
        <div>
          <div class="d-flex flex-column align-items-center gap-2">
            <TeamLogo :team-id="competitionTeam?.id" :size="150" />
            <ImageComp :src="competitionTeam?.sponsor" :width="100" />
          </div>
        </div>
      </div>
      <TableComp :fields="statsFields" :items="statsItems">
        <template #hist="{ value }">
          <LastGames :value="value" />
        </template>
      </TableComp>
      <hr />
      <PlayerGamesList :items="playerGames" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
