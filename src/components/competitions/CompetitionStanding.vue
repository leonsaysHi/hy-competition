<script lang="ts" setup>
import { computed } from 'vue'
import TableComp from '@/components/TableComp.vue'
import LastGames from '@/components/games/LastGames.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs'
import type { CompetitionStanding } from '@/models/CompetitionComputed'

interface IProps {
  value: CompetitionStanding[]
}

const props = withDefaults(defineProps<IProps>(), {})

const { getTeamName } = useLibs()
const fields = [
  {
    label: 'Pos',
    key: 'pos',
    sortable: true,
    thClass: 'text-end',
    tdClass: 'text-end fw-bold pe-2'
  },
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
    <template #pos="{ value }">
      <span :class="`fs-${2 + Math.min(value, 3)}`">{{ value }}</span>
    </template>
    <template #id="{ value }">
      <RouterLink
        class="d-flex align-items-center gap-2 link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
        :to="{ name: 'competition-team', params: { teamId: value } }"
      >
        <TeamLogo :team-id="value" :size="40" />
        <strong class="jersey-team fs-5">{{ getTeamName(value) }}</strong>
      </RouterLink>
    </template>
    <template #hist="{ value }"
      ><LastGames :value="value" :length="5" class="d-inline-flex"
    /></template>
  </TableComp>
</template>
