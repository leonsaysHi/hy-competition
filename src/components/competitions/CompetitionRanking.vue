<script lang="ts" setup>
import { computed } from 'vue'
import StatsTableComp from '@/components/StatsTableComp.vue'

import type { CompetitionRanking, CompetitionRankingComputed } from '@/types/computed'
import type { TableField } from '@/types/comp-table'
import type { PlayerRankingKey, PlayerStats } from '@/types/stats'

import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import type { TeamId } from '@/types/teams'
const { t } = useI18n()

interface IProps {
  value: CompetitionRankingComputed[]
  limit?: number
  teamId?: TeamId
  showAvg?: boolean
  showAvgUi?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  limit: 0,
  showAvg: true,
  showAvgUi: true
})

const route = useRoute()
const { competitionId } = route.params as { competitionId: string; playerId: string }

const { 
  row,
  trackedPlayerRankingKeys
} = useCompetition(competitionId)
const fields = computed(() => [
  {
    label: t('options.rankingStats.text.pos'),
    key: 'pos',
    thClass: 'text-center',
    tdClass: 'text-center'
  },
  { label: t('global.player', 2), key: 'id' },
  { label: t('global.team', 2), key: 'teamId' },
  ...trackedPlayerRankingKeys.value.map(
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
        .filter(
          (row: CompetitionRanking) => row.gp > 0 && (!props.teamId || row.teamId === props.teamId)
        )
        .map((row: CompetitionRanking) => ({
          ...row,
          id: row.playerId
        }))
    : []
)
</script>
<template>
  <StatsTableComp
    :fields="fields"
    :items="items"
    :limit="limit"
    sorted-key="pts"
    sorted-direction="desc"
    :show-avg="showAvg"
    :show-avg-ui="showAvgUi"
  >
    <template #title>
      <slot name="title"></slot>
    </template>
    </StatsTableComp>
</template>
