<script lang="ts" setup>
import { computed } from 'vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import type { PlayerCalculatedStats, PlayerStatKey } from '@/types/stats'
import type { GameBoxScoreComputed } from '@/types/computed'
import type { TeamId, CompetitionTeam } from '@/types/teams'
import type { CompetitionPlayer, PlayerId } from '@/types/players'
import useLibs from '@/composable/useLibs'
import { useI18n } from 'vue-i18n'
import useStats from '@/composable/useStats'

const { t } = useI18n()
const { playerStatsKeys } = useStats()
const { getTeamName } = useLibs()

interface IProps {
  boxscore: GameBoxScoreComputed
  teams: CompetitionTeam[]
}

const props = withDefaults(defineProps<IProps>(), {})



const teamsTotalsByStats = computed(() => {
  return props.teams.reduce((teams, team: CompetitionTeam) => {
    const teamId: TeamId = team.id
    teams[teamId] = playerStatsKeys.reduce((totals, key: PlayerStatKey) => {
      const boxscores: PlayerCalculatedStats[] = team.players.map(
        (player: CompetitionPlayer): PlayerCalculatedStats => {
          const playerId: PlayerId = player.id
          return props.boxscore[playerId]
        }
      )
      totals[key] = boxscores.reduce((tot: number, bs: PlayerCalculatedStats) => tot + bs[key], 0)
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
  playerStatsKeys.forEach((key: PlayerStatKey) => {
    const vals = Object.keys(teamsTotalsByStats.value).map((teamId: TeamId) => {
      return teamsTotalsByStats.value[teamId][key]
    })
    const hightVal = Math.max(...vals)
    Object.keys(teamsTotalsByStats.value).forEach((teamId: TeamId, idx: number) => {
      result[teamId][key] = Math.floor((vals[idx] * 40) / hightVal)
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
  <template v-for="(key, idx) in playerStatsKeys" :key="key">
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
