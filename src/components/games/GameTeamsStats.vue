<script lang="ts" setup>
import type { Option } from '@/types/comp-fields'
import { computed } from 'vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import type { PlayerRankingKey, PlayerStatKey } from '@/types/stats'
import type { GameBoxScoreComputed } from '@/types/computed'
import { TeamId, CompetitionTeam } from '@/types/teams'
import { PlayerId } from '@/types/players'
import { useRoute } from 'vue-router'
import useOptionsLib from '@/composable/useOptionsLib'
import useCompetition from '@/composable/useCompetition'
import useLibs from '@/composable/useLibs'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const { competitionId } = route.params
const { row: competition } = useCompetition(competitionId)
const { playerStatsKeys } = useOptionsLib()
const { getTeamName } = useLibs()

interface IProps {
  boxscore: GameBoxScoreComputed
  teams: CompetitionTeam[]
}

const props = withDefaults(defineProps<IProps>(), {})

const competitionStatsKeys = computed<PlayerStatKey[]>(() => {
  return competition.value?.trackedStats
    ? playerStatsKeys
        .filter((opt: Option) =>
          competition.value.trackedStats.includes(opt.value as PlayerRankingKey)
        )
        .map((opt: Option) => opt.value as PlayerStatKey)
    : []
})

const teamsTotalsByStats = computed(() => {
  return props.teams.reduce((teams, team: CompetitionTeam) => {
    const teamId: TeamId = team.id
    teams[teamId] = competitionStatsKeys.value.reduce((totals, statKey: PlayerStatKey) => {
      const boxscores: PlayerBoxScore[] = team.players.map(
        (player: CompetitionPlayer): PlayerBoxScore => {
          const playerId: PlayerId = player.id
          return props.boxscore[playerId]
        }
      )
      totals[statKey] = boxscores.reduce((tot: number, bs: PlayerBoxScore) => tot + bs[statKey], 0)
      return totals
    }, {})
    return teams
  }, {})
})
const teamsBarsByStats = computed(() => {
  const result = Object.keys(teamsTotalsByStats.value).reduce((result, teamId: TeamId) => {
    result[teamId] = {}
    return result
  }, {})
  competitionStatsKeys.value.forEach((statKey: PlayerStatKey) => {
    const vals = Object.keys(teamsTotalsByStats.value).map((teamId: TeamId) => {
      return teamsTotalsByStats.value[teamId][statKey]
    })
    const hightVal = Math.max(...vals)
    Object.keys(teamsTotalsByStats.value).forEach((teamId: TeamId, idx: number) => {
      result[teamId][statKey] = Math.floor((vals[idx] * 40) / hightVal)
    })
  })
  return result
})
</script>
<template>
  <div class="row row-cols-3 g-2">
    <div class="col vstack gap-3">
      <div class="vstack gap-2 align-items-center">
        <TeamLogo :team-id="teams[0].id" size="60" />
        <strong class="text-center font-team">{{ getTeamName(teams[0].id) }}</strong>
      </div>
    </div>
    <div></div>
    <div class="col vstack gap-3">
      <div class="vstack gap-2 align-items-center">
        <TeamLogo :team-id="teams[1].id" size="60" />
        <strong class="text-center font-team">{{ getTeamName(teams[1].id) }}</strong>
      </div>
    </div>
  </div>
  <template v-for="(statKey, idx) in competitionStatsKeys" :key="statKey">
    <template v-if="idx"><hr /></template>
    <div class="row row-cols-3 g-4">
      <div class="col text-end display-4 fw-bold vstack justify-content-center">
        {{ teamsTotalsByStats[teams[0].id][statKey] }}
      </div>
      <div class="col text-center fw-bold vstack justify-content-center">
        {{ t('options.playerStats.long.' + statKey) }}
      </div>
      <div class="col display-4 fw-bold vstack justify-content-center">
        {{ teamsTotalsByStats[teams[1].id][statKey] }}
      </div>
    </div>
    <div class="progress-stacked" style="height: 5px">
      <div
        class="progress"
        role="progressbar"
        aria-label="Segment one"
        :style="`width: ${teamsBarsByStats[teams[0].id][statKey]}%;`"
      >
        <div
          class="progress-bar"
          :class="
            teamsBarsByStats[teams[0].id][statKey] >= teamsBarsByStats[teams[1].id][statKey]
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
        :style="`width: ${teamsBarsByStats[teams[1].id][statKey]}%;`"
      >
        <div
          class="progress-bar"
          :class="
            teamsBarsByStats[teams[0].id][statKey] <= teamsBarsByStats[teams[1].id][statKey]
              ? 'bg-success'
              : 'bg-secondary'
          "
        ></div>
      </div>
    </div>
  </template>
</template>
