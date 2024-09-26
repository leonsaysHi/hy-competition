<script lang="ts" setup>
import { computed } from 'vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import type { Option } from '@/types/comp-fields'
import type { PlayerCalculatedStats, PlayerStatLine, PlayerStatLineKey } from '@/types/player-stats'
import type { TeamId, CompetitionTeam } from '@/types/team'
import type { CompetitionPlayer } from '@/types/player'
import useLibs from '@/composable/useLibs'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import type { GameDocBoxScore } from '@/types/games'
import { getPlayerCalculatedStatsFromPlayerGamesStats, mergeStatLines, playerCalculatedStatsKeys } from '@/utils/stats/basketball'

const { t } = useI18n()
const { getTeamName } = useLibs()
const route = useRoute()
const { competitionId } = route.params as { competitionId: string; gameId: string }

const { trackedPlayerRankingKeys } = useCompetition(competitionId)
interface IProps {
  boxscore: GameDocBoxScore
  teams: CompetitionTeam[]
}

const props = withDefaults(defineProps<IProps>(), {})

const statKeys = computed<PlayerStatLineKey[]>(() => {
  return trackedPlayerRankingKeys.value
    .map((opt: Option)  => opt.value as PlayerStatLineKey)
    .filter((key: PlayerStatLineKey) => playerCalculatedStatsKeys.includes(key))
})
const teamsTotalsByStats = computed(() => {
  const bs:GameDocBoxScore = props.boxscore
  return props.teams.reduce((result, team: CompetitionTeam) => {
    const statLines: PlayerStatLine[] = team.players
      .map((player: CompetitionPlayer) => bs[player.id] || {} as PlayerStatLine)
    result[team.id] = getPlayerCalculatedStatsFromPlayerGamesStats([ mergeStatLines(statLines) ])
    return result
  }, {} as { [key: TeamId]: PlayerCalculatedStats })
})
const teamsBarsByStats = computed(() => {
  const result:{ [key: TeamId]: { [key: PlayerStatLineKey]: number } } =  {}
  Object.keys(teamsTotalsByStats.value).forEach((teamId: TeamId) => {
    result[teamId] = {}
    return result
  })
  statKeys.value
    .forEach((key: PlayerStatLineKey) => {
      const vals = Object.keys(teamsTotalsByStats.value)
        .map((teamId: TeamId) => {
          return teamsTotalsByStats.value[teamId][key]
        })
      const hightVal = Math.max(...vals)
      Object.keys(teamsTotalsByStats.value).forEach((teamId: TeamId, idx: number) => {
        result[teamId][key] = Math.floor((vals[idx] * 45) / hightVal)
      })
    })
  return result
})
</script>
<template>
  <div class="row row-cols-3 g-2">
    <div class="col vstack gap-3">
      <div class="vstack gap-2 align-items-center">
        <TeamLogo :team-id="teams[0].id" :size="60" />
        <strong class="text-center font-team">{{ getTeamName(teams[0].id) }}</strong>
      </div>
    </div>
    <div></div>
    <div class="col vstack gap-3">
      <div class="vstack gap-2 align-items-center">
        <TeamLogo :team-id="teams[1].id" :size="60" />
        <strong class="text-center font-team">{{ getTeamName(teams[1].id) }}</strong>
      </div>
    </div>
  </div>
  <template v-for="(key, idx) in statKeys" :key="key">
    <template v-if="idx"><hr /></template>
    <div class="row row-cols-3 g-4">
      <div class="col text-end display-4 fw-bold vstack justify-content-center">
        {{ teamsTotalsByStats[teams[0].id][key] }}
      </div>
      <div class="col text-center fw-bold vstack justify-content-center">
        {{ t('options.playerStats.long.' + key) }}
      </div>
      <div class="col display-4 fw-bold vstack justify-content-center">
        {{ teamsTotalsByStats[teams[1].id][key] }}
      </div>
    </div>
    <div class="progress-stacked" style="height: 5px">
      <div
        class="progress"
        role="progressbar"
        aria-label="Segment one"
        :style="`width: ${teamsBarsByStats[teams[0].id][key]}%;`"
      >
        <div
          class="progress-bar"
          :class="
            teamsBarsByStats[teams[0].id][key] >= teamsBarsByStats[teams[1].id][key]
              ? 'bg-success'
              : 'bg-secondary'
          "
        ></div>
      </div>
      <div
        class="progress ms-auto"
        role="progressbar"
        aria-label="Segment two"
        aria-valuenow="30"
        aria-valuemin="0"
        aria-valuemax="100"
        :style="`width: ${teamsBarsByStats[teams[1].id][key]}%;`"
      >
        <div
          class="progress-bar"
          :class="
            teamsBarsByStats[teams[0].id][key] <= teamsBarsByStats[teams[1].id][key]
              ? 'bg-success'
              : 'bg-secondary'
          "
        ></div>
      </div>
    </div>
  </template>
</template>
