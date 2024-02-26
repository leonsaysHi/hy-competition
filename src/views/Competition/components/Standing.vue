<script lang="ts" setup>
import { computed } from 'vue'
import TableComp from '@/components/TableComp.vue'
import LastGames from '@/components/games/LastGames.vue'

import useLibs from '@/composable/useLibs'
import type { CompetitionGroupStanding } from '@/types/computed'

interface IProps {
  value: CompetitionGroupStanding[]
}

const props = withDefaults(defineProps<IProps>(), {})

const { getTeamName } = useLibs()
const fields = [
  { label: 'Pos', key: 'pos', thClass: 'text-center', tdClass: 'text-center' },
  { label: 'Teams', key: 'id' },
  { label: 'GP', key: 'gp', sortable: true, tdClass: 'text-end' },
  { label: 'W', key: 'wins', sortable: true, tdClass: 'text-end' },
  { label: 'PTS+', key: 'ptspos', sortable: true, tdClass: 'text-end' },
  { label: 'PTS-', key: 'ptsneg', sortable: true, tdClass: 'text-end' },
  { label: 'L5', key: 'hist' }
]
const items = computed(() => props.value)
</script>
<template>
  <TableComp :fields="fields" :items="items" small>
    <template #id="{ value }">{{ getTeamName(value) }}</template>
    <template #hist="{ value }"><LastGames :value="value" :length="5" /></template>
  </TableComp>
</template>
