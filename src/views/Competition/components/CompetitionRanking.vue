<script lang="ts" setup>
import { computed } from 'vue'
import TableComp from '@/components/TableComp.vue'

import useLibs from '@/composable/useLibs'
import useOptionsLibs from '@/composable/useOptionsLib'
import type { CompetitionRanking } from '@/types/computed'
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
const { statsKeys } = useOptionsLibs()

const row = getCompetition(competitionId)
const fields = computed(() => [
  { label: 'Pos', key: 'pos' },
  { label: 'Players', key: 'id', tdClass: 'fw-bold' },
  { label: 'Team', key: 'teamId' },
  { label: 'GP', key: 'gp', sortable: true, thClass: 'text-end', tdClass: 'text-end' },
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
const items = computed(() => (!props.length ? props.value : props.value.slice(0, props.length)))
</script>
<template>
  <TableComp :fields="fields" :items="items" sorted-key="pts" sorted-direction="desc" small>
    <template #pos="{ index }">{{ index + 1 }}</template>
    <template #id="{ value }">{{ getPlayerName(value) }}</template>
    <template #teamId="{ value }">{{ getTeamName(value) }}</template>
  </TableComp>
</template>
