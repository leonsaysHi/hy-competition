<script lang="ts" setup>
import { computed, ref } from 'vue'
import TableComp from '@/components/TableComp.vue'

import useLibs from '@/composable/useLibs'
import useOptionsLibs from '@/composable/useOptionsLib'
import type { CompetitionRanking } from '@/types/computed'
import { useRoute } from 'vue-router'
import type { TableField } from '@/types/comp-table'
import type { StatKey } from '@/types/stats'

interface IProps {
  value: CompetitionRanking[]
}

const route = useRoute()
const { competitionId } = route.params
const props = withDefaults(defineProps<IProps>(), {})

const { getTeamName, getPlayerName, getCompetition } = useLibs()
const { statsKeys } = useOptionsLibs()

const row = getCompetition(competitionId)
const fields = computed(() => [
  { label: 'Pos', key: 'pos' },
  { label: 'Players', key: 'id', tdClass: 'fw-bold' },
  { label: 'Team', key: 'teamId' },
  { label: 'GP', key: 'gp', sortable: true, thClass: 'text-center', tdClass: 'text-end' },
  ...statsKeys.reduce((fields: TableField[], opt): TableField[] => {
    if (row?.trackedStats.includes(opt.value)) {
      return [
        ...fields,
        {
          key: opt.value,
          label: opt.text,
          sortable: true,
          thClass: 'text-center',
          tdClass: 'text-end'
        }
      ]
    }
    return fields
  }, [])
])
const items = computed(() => props.value)
</script>
<template>
  <TableComp :fields="fields" :items="items" sorted-key="pts" small>
    <template #pos="{ index }">{{ index + 1 }}</template>
    <template #id="{ value }">{{ getPlayerName(value) }}</template>
    <template #teamId="{ value }">{{ getTeamName(value) }}</template>
  </TableComp>
</template>
