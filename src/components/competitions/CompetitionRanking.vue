<script lang="ts" setup>
import { computed } from 'vue'
import StatsTableComp from '@/components/StatsTableComp.vue'

import type { CompetitionRanking, CompetitionRankingComputed } from '@/types/computed'
import type { TableField } from '@/types/comp-table'
import type { PlayerRankingKey } from '@/types/stats'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

interface IProps {
  value: CompetitionRankingComputed[]
  limit?: number
}

const props = withDefaults(defineProps<IProps>(), {
  limit: 0
})

const rankingKeys: PlayerRankingKey[] = ['gp', 'pts', 'fg3m', 'reb', 'ast', 'blk', 'stl', 'tov']

const fields = computed(() => [
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
])
const items = computed(() =>
  Array.isArray(props.value)
    ? props.value
        .filter((row: CompetitionRanking) => row.gp > 0)
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
  ></StatsTableComp>
</template>
