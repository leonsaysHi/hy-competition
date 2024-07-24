<script lang="ts" setup>
import { computed } from 'vue'
import StatsTableComp from '@/components/StatsTableComp.vue'

import type { CompetitionRanking, CompetitionRankingComputed } from '@/types/computed'
import type { TableField } from '@/types/comp-table'
import type { PlayerRankingKey } from '@/types/stats'

import { useI18n } from 'vue-i18n'
import type { TeamId } from '@/types/teams'
const { t } = useI18n()

interface IProps {
  value: CompetitionRanking[]
  limit?: number
  teamId?: TeamId
  showAvg?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  limit: 0,
  teamId: undefined,
  showAvg: true
})

const rankingKeys: PlayerRankingKey[] = ['gp', 'pts', 'fg3m', 'reb', 'ast', 'blk', 'stl', 'tov']

const fields = computed(() => {
  const result = [
    {
      label: t('options.rankingStats.text.pos'),
      key: 'pos',
      thClass: 'text-center',
      tdClass: 'text-center'
    },
    { label: t('global.player', 2), key: 'id' },
    { label: t('global.team', 2), key: 'teamId' },
    ...rankingKeys.map(
      (key: PlayerRankingKey): TableField => ({
        key,
        label: t(`options.playerStats.text.${key}`),
        sortable: true,
        thClass: 'text-end',
        tdClass: 'text-end'
      })
    )
  ]
  if (props.teamId) {
    ;['pos', 'teamId'].forEach((key: string) => {
      const idx = result.findIndex((f: TableField) => f.key === key)
      if (idx > -1) {
        result.splice(idx, 1)
      }
    })
  }
  return result
})
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
    :show-avg="showAvg"
    sorted-key="pts"
    sorted-direction="desc"
  ></StatsTableComp>
</template>
