<script lang="ts" setup>
import { computed } from 'vue'
import TableComp from '@/components/TableComp.vue'
import LastGames from '@/components/games/LastGames.vue'
import Logo from '@/components/teams/Logo.vue'
import useLibs from '@/composable/useLibs'
import type { CompetitionGroupStanding } from '@/types/computed'

interface IProps {
  value: CompetitionGroupStanding[]
}

const props = withDefaults(defineProps<IProps>(), {})

const { getTeamName } = useLibs()
const fields = [
  { label: 'Pos', key: 'pos', sortable: true, thClass: 'text-end', tdClass: 'text-end' },
  { label: 'Teams', key: 'id' },
  { label: 'GP', key: 'gp', sortable: true, thClass: 'text-end', tdClass: 'text-end' },
  { label: 'W', key: 'wins', sortable: true, thClass: 'text-end', tdClass: 'text-end' },
  { label: 'PTS+', key: 'ptspos', sortable: true, thClass: 'text-end', tdClass: 'text-end' },
  { label: 'PTS-', key: 'ptsneg', sortable: true, thClass: 'text-end', tdClass: 'text-end' },
  { label: 'L5', key: 'hist', thClass: 'text-center', tdClass: 'text-end' }
]
const items = computed(() => props.value)
</script>
<template>
  <TableComp :fields="fields" :items="items" sorted-key="pos" sorted-direction="asc" small>
    <template #id="{ value }">
      <div class="d-flex align-items-center gap-2">
        <Logo :team-id="value" :size="40" />
        <strong>{{ getTeamName(value) }}</strong>
      </div>
    </template>
    <template #hist="{ value }"
      ><LastGames :value="value" :length="5" class="d-inline-flex"
    /></template>
  </TableComp>
</template>
