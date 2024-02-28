<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import TableComp from '@/components/TableComp.vue'

import useLibs from '@/composable/useLibs'
import useOptionsLibs from '@/composable/useOptionsLib'
import { useRoute } from 'vue-router'
import type { TableField } from '@/types/comp-table'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer } from '@/types/players'
import type { GameBoxScore } from '@/types/games'

interface IProps {
  boxscore: GameBoxScore
  teams: CompetitionTeam[]
}

const route = useRoute()
const { competitionId } = route.params
const props = withDefaults(defineProps<IProps>(), {})

const { getTeamName, getPlayerName, getCompetition } = useLibs()
const { statsKeys } = useOptionsLibs()

const row = getCompetition(competitionId)

const fields = computed(() => [
  { label: '#', key: 'number' },
  { label: 'Player', key: 'id', tdClass: 'fw-bold' },
  ...statsKeys.reduce((fields: TableField[], opt): TableField[] => {
    if (row?.trackedStats.includes(opt.value)) {
      return [
        ...fields,
        {
          key: opt.value,
          label: opt.text,
          sortable: true,
          thClass: 'text-end',
          tdClass: 'text-end'
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
</script>
<template>
  <ul class="mb-3 nav nav-underline justify-content-center">
    <template v-for="team in props.teams" :key="team.id">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="[currentTeamId === team.id && 'active']"
          :aria-current="currentTeamId === team.id ? 'page' : false"
          href="#"
          @click="currentTeamId = team.id"
          >{{ getTeamName(team.id) }}</a
        >
      </li>
    </template>
  </ul>
  <TableComp :fields="fields" :items="boxScoreItems" sorted-key="pts" sorted-direction="desc" small>
    <template #number="{ value }">#{{ value }}</template>
    <template #id="{ value }">{{ getPlayerName(value) }}</template>
  </TableComp>
</template>
