<template>
  <div>
    <template v-if="scores[0].periods.length > 1">
      <TableComp :fields="fields" :items="items">
        <template #id="{ value }">
          {{ value.short }}
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

const { getTeam } = useLibs()

interface IProps {
  scores: ScoresComputed[]
}
const props = withDefaults(defineProps<IProps>(), {})

const fields = computed((): TableField[] => {
  return [
    {
      key: 'id',
      label: 'Team',
      tdClass: 'jersey-team text-uppercase'
    },
    ...props.scores[0].periods.map((n: number, idx: number) => ({
      key: `p${idx}`,
      label: `Q${idx + 1}`,
      thClass: 'text-center',
      tdClass: 'text-center'
    }))
  ] as TableField[]
})
const items = computed(() => {
  return props.scores.map(
    (score: ScoresComputed): TableItem => ({
      id: getTeam(score.id),
      ...score.periods.reduce((acc: {}, n: number, idx: number) => {
        return {
          ...acc,
          [`p${idx}`]: n
        }
      }, {})
    })
  )
})
</script>
