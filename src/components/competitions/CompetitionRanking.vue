<script lang="ts" setup>
import { computed } from 'vue'
import TableComp from '@/components/TableComp.vue'

import useLibs from '@/composable/useLibs'
import useOptionsLibs from '@/composable/useOptionsLib'
import type { CompetitionRanking } from '@/types/computed'
import { useRoute } from 'vue-router'
import type { TableField } from '@/types/comp-table'
import { getOrd, getAvg } from '@/utils/maths'
import type { PlayerStats } from '@/types/stats'
import type { Option } from '@/types/comp-fields'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

interface IProps {
  value: CompetitionRanking[]
  length?: number
}

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const props = withDefaults(defineProps<IProps>(), {
  length: 0
})

const { getTeamName, getPlayerName, getCompetition } = useLibs()
const { playerRankingKeys, playerStatsKeys } = useOptionsLibs()
const competition = getCompetition(competitionId)

const fields = computed(() => [
  {
    label: t('options.rankingStats.text.pos'),
    key: 'pos',
    thClass: 'text-center',
    tdClass: 'text-center'
  },
  { label: t('global.player', 2), key: 'playerId' },
  { label: t('global.team', 2), key: 'teamId' },
  ...playerRankingKeys
    .filter((opt: Option) => competition?.trackedStats.includes(opt.value))
    .map(
      (opt: Option): TableField => ({
        key: opt.value,
        label: opt.text,
        sortable: true,
        thClass: 'text-end',
        tdClass: 'text-end'
      })
    )
])
const items = computed(() =>
  Array.isArray(props.value)
    ? props.value
        .filter((row: CompetitionRanking) => row.gp > 0)
        .map((row: CompetitionRanking) => ({
          ...row,
          ...playerStatsKeys
            .filter((opt: Option) => competition?.trackedStats.includes(opt.value))
            .reduce((result: PlayerStats, opt: Option) => {
              const key = opt.value as PlayerStatKey
              result[key] = getAvg(row[key], row.gp)
              return result
            }, {} as PlayerStats)
        }))
    : []
)
</script>
<template>
  <TableComp
    :fields="fields"
    :items="items"
    :sorted-key="playerRankingKeys[0].value"
    :per-page="5"
    small
    show-empty
    desc-only
  >
    <template #pos="{ index }"
      >{{ index + 1 }}<sup>{{ getOrd(index + 1) }}</sup></template
    >
    <template #playerId="{ value }">
      <RouterLink
        class="link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
        :to="{
          name: 'competition-player',
          params: { competitionId: competitionId, playerId: value }
        }"
      >
        <strong class="jersey-name">{{ getPlayerName(value) }}</strong>
      </RouterLink>
    </template>
    <template #teamId="{ value }"
      ><span class="jersey-team">{{ getTeamName(value) }}</span></template
    >
  </TableComp>
</template>
