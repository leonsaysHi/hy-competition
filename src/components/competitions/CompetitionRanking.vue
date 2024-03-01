<script lang="ts" setup>
import { computed } from 'vue'
import TableComp from '@/components/TableComp.vue'

import useLibs from '@/composable/useLibs'
import useOptionsLibs from '@/composable/useOptionsLib'
import type { CompetitionRanking } from '@/models/CompetitionComputed'
import { useRoute } from 'vue-router'
import type { TableField } from '@/types/comp-table'

interface IProps {
  value: CompetitionRanking[]
  length?: number
}

const route = useRoute()
const { competitionId } = route.params
const props = withDefaults(defineProps<IProps>(), {
  length: 0
})

const { getTeamName, getPlayerName, getCompetition } = useLibs()
const { playerRankingKeys } = useOptionsLibs()

const row = getCompetition(competitionId)
const fields = computed(() => [
  { label: 'Pos', key: 'pos', thClass:'text-center', tdClass:'text-center' },
  { label: 'Players', key: 'id' },
  { label: 'Team', key: 'teamId' },
  ...playerRankingKeys.reduce((fields: TableField[], opt): TableField[] => {
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
const items = computed(() => Array.isArray(props.value) 
  ? props.value.filter((row: CompetitionRanking) => row.gp > 0) 
  : []
)
</script>
<template>
  <TableComp
    :fields="fields"
    :items="items"
    sorted-key="pts"
    sorted-direction="desc"
    :per-page="5"
    small
    show-empty
  >
    <template #pos="{ index }">{{ index + 1 }}</template>
    <template #id="{ value }">
      <RouterLink
        class="link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
        :to="{ name: 'competition-player', params: { playerId: value } }"
      >
        <strong class="jersey-name">{{ getPlayerName(value) }}</strong>
      </RouterLink>
    </template>
    <template #teamId="{ value }"
      ><span class="jersey-team">{{ getTeamName(value) }}</span></template
    >
  </TableComp>
</template>
