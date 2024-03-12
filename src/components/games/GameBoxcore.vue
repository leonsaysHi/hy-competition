<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import TableComp from '@/components/TableComp.vue'

import useLibs from '@/composable/useLibs'
import useOptionsLibs from '@/composable/useOptionsLib'
import { useRoute } from 'vue-router'
import type { TableField, TableItem } from '@/types/comp-table'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer } from '@/types/players'
import type { GameBoxScore } from '@/types/games'
import type { PlayerStatKey } from '@/types/stats'

import { useI18n } from 'vue-i18n'
import TeamLogo from '../teams/TeamLogo.vue'
const { t } = useI18n()
interface IProps {
  boxscore: GameBoxScore
  teams: CompetitionTeam[]
}

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const props = withDefaults(defineProps<IProps>(), {})

const { getPlayerName, getCompetition } = useLibs()
const { playerStatsKeys } = useOptionsLibs()

const row = getCompetition(competitionId)

const fields = computed(() => [
  { label: '#', key: 'number' },
  { label: 'Player', key: 'id', tdClass: 'fw-bold' },
  ...playerStatsKeys.reduce((fields: TableField[], opt): TableField[] => {
    if (row?.trackedStats.includes(opt.value)) {
      return [
        ...fields,
        {
          key: opt.value,
          label: opt.text,
          sortable: true,
          thClass: 'text-end',
          tdClass: 'text-end',
          tfClass: 'text-end fw-bold'
        }
      ]
    }
    return fields
  }, [])
])

const currentTeamId = ref<TeamId | undefined>()
watchEffect(() => {
  currentTeamId.value = Array.isArray(props.teams) && props.teams[0] ? props.teams[0].id : undefined
})
const boxScoreItems = computed(() => {
  const team = props.teams.find((team: CompetitionTeam) => team.id === currentTeamId.value)
  return team?.players.map((player: CompetitionPlayer) => ({
    ...player,
    ...props.boxscore[player.id]
  }))
})
const totalsItem = computed<TableItem>(() => ({
  number: '',
  id: '',
  ...playerStatsKeys.reduce((item: TableItem, opt: Option): TableItem => {
    const key = opt.value as PlayerStatKey
    item[key] = boxScoreItems.value?.reduce((tot: number, row) => tot + row[key], 0) || 0
    return item
  }, {})
}))
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
  <TableComp
    :fields="fields"
    :items="boxScoreItems"
    :footer="totalsItem"
    sorted-key="pts"
    sorted-direction="desc"
    small
  >
    <template #number="{ value }">#{{ value }}</template>
    <template #id="{ value }"
      ><RouterLink
        class="d-flex align-items-center gap-2 link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
        :to="{
          name: 'competition-player',
          params: { competitionId: competitionId, playerId: value }
        }"
      >
        {{ getPlayerName(value) }}
      </RouterLink></template
    >
    <template #footerid
      ><span class="fw-lighter">{{ t('global.total', 2) }}</span></template
    >
  </TableComp>
</template>
