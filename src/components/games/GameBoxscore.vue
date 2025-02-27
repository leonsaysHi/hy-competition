<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import StatsTableComp from '@/components/StatsTableComp.vue'

import type { TableField } from '@/types/comp-table'
import type { CompetitionTeam, TeamId } from '@/types/team'
import type { CompetitionPlayer, PlayerId } from '@/types/player'

import TeamLogo from '../teams/TeamLogo.vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import type { CompetitionId } from '@/types/competitions'
import type { PlayerCalculatedStatsKey } from '@/types/player-stats'
import type { GameDocBoxScore } from '@/types/games'
import { getPlayerCalculatedStatsFromPlayerGamesStats, mergeStatLines, playerCalculatedStatsKeys } from '@/utils/stats/basketball'



const { t } = useI18n()

interface IProps {
  boxscore: GameDocBoxScore
  teams: CompetitionTeam[]
}

const props = withDefaults(defineProps<IProps>(), {})

const route = useRoute()
const { competitionId } = route.params as { competitionId: CompetitionId }
const { row } = useCompetition(competitionId)

const boxScoreKeys = computed<PlayerCalculatedStatsKey[]>(() => {
  if (!row.value?.statsInput) {
    return []
  }
  return playerCalculatedStatsKeys
    .filter((key: PlayerCalculatedStatsKey) =>
      row.value?.trackedStats.includes(key)
    )
})

const fields = computed(() => {
  const fields = [
    { label: '#', key: 'number' },
    { label: t('global.player'), key: 'id', tdClass: 'fw-bold' },
    ...boxScoreKeys.value
      .reduce(
        (fields: TableField[], key: PlayerCalculatedStatsKey): TableField[] => [
          ...fields,
          {
            key,
            label: t(`options.playerStats.text.${key}`),
            sortable: true,
            thClass: 'text-end',
            tdClass: 'text-end',
            tfClass: 'text-end fw-bold'
          }
        ],
        []
      )
  ]
  const ptsField = {
    key: 'pts',
    label: t('options.playerStats.text.pts'),
    sortable: true,
    thClass: 'text-end',
    tdClass: 'text-end',
    tfClass: 'text-end fw-bold'
  }
  fields.splice(fields.findIndex((field) => field.key === 'id') + 1, 0, ptsField)
  return fields
})

const currentTeamId = ref<TeamId | undefined>()
watchEffect(() => {
  currentTeamId.value = Array.isArray(props.teams) && props.teams[0] ? props.teams[0].id : undefined
})
const items = computed(() => {
  const team = props.teams.find((team: CompetitionTeam) => team.id === currentTeamId.value)
  return team?.players.map((player: CompetitionPlayer) => {
    const playerId: PlayerId = player.id
    return {
      ...player,
      ...getPlayerCalculatedStatsFromPlayerGamesStats(
        [ mergeStatLines([ props.boxscore[playerId] ]) ]
      )
    }
  })
})
</script>
<template>
  <ul class="mb-3 nav nav-underline justify-content-center">
    <template v-for="team in props.teams" :key="team.id">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="[currentTeamId === team.id && 'active']"
          :aria-current="currentTeamId === team.id ? 'page' : false"
          @click="currentTeamId = team.id"
        >
          <div class="vstack align-items-center">
            <TeamLogo :team-id="team.id" :size="50" />
          </div>
        </a>
      </li>
    </template>
  </ul>
  <StatsTableComp
    :fields="fields"
    :items="items"
    sorted-key="pts"
    sorted-direction="desc"
    show-total
  ></StatsTableComp>
</template>
