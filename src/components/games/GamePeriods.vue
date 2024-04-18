<template>
  <div>
    <template v-if="scores[0].periods.length >= 1">
      <TableComp :fields="fields" :items="items">
        <template #team="{ value }">
          <span class="fs-6">{{ value.short }}</span>
        </template>
        <template #p0="{ value }">
          <span :class="{ 'fw-bold': value.win }">{{ value.score }}</span>
        </template>
        <template #p1="{ value }">
          <span :class="{ 'fw-bold': value.win }">{{ value.score }}</span>
        </template>
        <template #p2="{ value }">
          <span :class="{ 'fw-bold': value.win }">{{ value.score }}</span>
        </template>
        <template #p3="{ value }">
          <span :class="{ 'fw-bold': value.win }">{{ value.score }}</span>
        </template>
        <template #p4="{ value }">
          <span :class="{ 'fw-bold': value.win }">{{ value.score }}</span>
        </template>
        <template #p5="{ value }">
          <span :class="{ 'fw-bold': value.win }">{{ value.score }}</span>
        </template>
        <template #p6="{ value }">
          <span :class="{ 'fw-bold': value.win }">{{ value.score }}</span>
        </template>
        <template #p7="{ value }">
          <span :class="{ 'fw-bold': value.win }">{{ value.score }}</span>
        </template>
        <template #p8="{ value }">
          <span :class="{ 'fw-bold': value.win }">{{ value.score }}</span>
        </template>
      </TableComp>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import TableComp from '../TableComp.vue'
import useLibs from '@/composable/useLibs'
import type { ScoresComputed } from '@/models/GameComputed'
import type { TableField, TableItem } from '@/types/comp-table'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const { getTeam } = useLibs()

interface IProps {
  scores: ScoresComputed[]
}
const props = withDefaults(defineProps<IProps>(), {})

const fields = computed((): TableField[] => {
  return [
    {
      key: 'team',
      label: '',
      tdClass: 'font-team text-uppercase'
    },
    ...props.scores[0].periods.map((n: number, idx: number) => ({
      key: `p${idx}`,
      label: `${t('global.gameDetails.period.text')}${idx + 1}`,
      thClass: 'text-center',
      tdClass: 'text-center'
    }))
  ] as TableField[]
})
const items = computed(() => {
  return props.scores.map(
    (score: ScoresComputed, idx: number, arr: ScoresComputed[]): TableItem => ({
      team: getTeam(score.id),
      ...score.periods.reduce((acc: {}, n: number, pIdx: number) => {
        return {
          ...acc,
          [`p${pIdx}`]: { score: n, win: n >= arr[idx ? 0 : 1].periods[pIdx]  }
        }
      }, {})
    })
  )
})
</script>
