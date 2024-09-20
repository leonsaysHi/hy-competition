<script lang="ts" setup>
import { computed } from 'vue'
import TableComp from '@/components/TableComp.vue'
import LastGames from '@/components/games/LastGames.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs'
import useOptionsLibs from '@/composable/useOptionsLib'
import { useRoute } from 'vue-router'
import { getOrd } from '@/utils/maths'

import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'
import useStats from '@/composable/useStats'
import useCompetition from '@/composable/useCompetition'
import type { TableField } from '@/types/comp-table'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionStanding } from '@/types/computed'



interface IProps {
  games?: GameComputedClass[]
  teams?: CompetitionTeam[]
}
const props = withDefaults(defineProps<IProps>(), {
  games: () => [],
  teams: () => []
})

const route = useRoute()
const { competitionId } = route.params as { competitionId: string;  }
const { t } = useI18n()
const { teamStandingKeys } = useOptionsLibs()
const { getStandingsForGames } = useStats()

const { getTeamName } = useLibs()
const fields = [
  {
    label: t('options.rankingStats.text.pos'),
    key: 'pos',
    sortable: true,
    thClass: 'text-center',
    tdClass: 'text-center fw-bold pe-2'
  },
  { label: t('global.team', 2), key: 'teamId' },
  ...teamStandingKeys.map(
    (opt: Option): TableField => ({
      key: opt.value,
      label: opt.text,
      sortable: true,
      thClass: 'text-end',
      tdClass: 'text-end'
    })
  ),
  {
    label: t('options.standingStats.text.hist'),
    key: 'hist',
    thClass: 'text-center',
    tdClass: 'text-center'
  }
]
const items = computed<CompetitionStanding[]>(() => {
  const items = getStandingsForGames(props.teams, props.games)
    .map((row: CompetitionStanding, idx: number) => ({
      ...row,
      pos: idx + 1
    }))
  return items
})
</script>
<template>
  <TableComp :fields="fields" :items="items" sorted-key="pos" sorted-direction="asc" small>
    <template #pos="{ value, item }">
      <template v-if="Number(item.pos) <= items.length">
        <span :class="`fs-${4 + Math.min(value, 2)}`"
          >{{ value }}<sup class="fw-normal">{{ getOrd(value) }}</sup></span
        >
      </template>
      <template v-else>
        <span class="fs-6 fw-normal">-</span>
      </template>
    </template>
    <template #teamId="{ value }">
      <RouterLink
        class="d-flex align-items-center gap-2 link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
        :to="{ name: 'competition-team', params: { competitionId: competitionId, teamId: value } }"
      >
        <TeamLogo :team-id="value" :size="35" />
        <strong class="font-team fs-6">{{ getTeamName(value) }}</strong>
      </RouterLink>
    </template>
    <template #hist="{ value }"><LastGames :items="value" :length="5" /></template>
  </TableComp>
</template>
