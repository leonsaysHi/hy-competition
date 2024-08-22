<script lang="ts" setup>
import { computed } from 'vue'
import StatsTableComp from '@/components/StatsTableComp.vue'

import type { CompetitionRanking, CompetitionRankingComputed } from '@/types/computed'
import type { TableField } from '@/types/comp-table'
import type { PlayerRankingKey, PlayerStats } from '@/types/stats'

import { useI18n } from 'vue-i18n'
import type { TeamId } from '@/types/teams'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
const { t } = useI18n()

interface IProps {
  value: CompetitionRanking[]
  limit?: number
  teamId?: TeamId
  showCumul?: boolean
}

const route = useRoute()
const { competitionId } = route.params as { competitionId: string; playerId: string }

const props = withDefaults(defineProps<IProps>(), {
  limit: 0,
  teamId: undefined,
  showCumul: false
})
const { 
  row,
  trackedPlayerRankingKeys
} = useCompetition(competitionId)
 /*
const rankingKeys = computed<PlayerRankingKey[]>(() => {
  const keys = ['gp', 'pts', 'fg3m', 'ast', 'reb', 'blk', 'stl', 'tov'] as PlayerRankingKey[]
  return keys
    .filter((key:PlayerRankingKey) => {
      switch(key) {
        case 'gp': 
        case 'pts': 
          return true
        case 'reb':
          return row.value?.trackedStats.includes('dreb') || row.value?.trackedStats.includes('oreb')
        default: 
          return row.value?.trackedStats.includes(key as keyof PlayerStats)
      }
    }) || []    
})
*/
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
  )]
)
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
    :show-avg="!showCumul"
    show-avg-ui
  >
    <template #title>
      <slot name="title"></slot>
    </template>
  </StatsTableComp>
</template>
