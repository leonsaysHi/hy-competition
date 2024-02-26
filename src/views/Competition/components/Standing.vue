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
  { label: 'Pos', key: 'pos' },
  { label: 'Teams', key: 'id', tdClass: 'fw-bold' },
  { label: 'GP', key: 'gp', sortable: true, thClass: 'text-center', tdClass: 'text-end' },
  { label: 'W', key: 'wins', sortable: true, thClass: 'text-center', tdClass: 'text-end' },
  { label: 'PTS+', key: 'ptspos', sortable: true, thClass: 'text-center', tdClass: 'text-end' },
  { label: 'PTS-', key: 'ptsneg', sortable: true, thClass: 'text-center', tdClass: 'text-end' },
  { label: 'L5', key: 'hist', thClass: 'text-center', tdClass: 'text-end' }
]
const items = computed(() => props.value)
</script>
<template>
  <TableComp :fields="fields" :items="items" small>
    <template #id="{ value }">{{ getTeamName(value) }}</template>
    <template #hist="{ value }"
      ><LastGames :value="value" :length="5" class="d-inline-flex"
    /></template>
  </TableComp>
</template>
