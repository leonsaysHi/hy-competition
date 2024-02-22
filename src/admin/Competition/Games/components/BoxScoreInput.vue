<template>
  <TableComp :items="items" :fields="fields" small>
    <template #name="{ value }"
      ><div class="lh-1">{{ value }}</div></template
    >
    <template #pts="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp || disabled"
      />
    </template>
    <template #m3pts="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp || disabled"
      />
    </template>
    <template #reb="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp || disabled"
      />
    </template>
    <template #ast="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp || disabled"
      />
    </template>
    <template #stl="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp || disabled"
      />
    </template>
    <template #blk="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp || disabled"
      />
    </template>
    <template #to="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp || disabled"
      />
    </template>
    <template #pf="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp || disabled"
      />
    </template>
    <template #dnp="{ key, item }">
      <CheckComp
        v-model="model[item.id][key]"
        :value="false"
        :uncheck-value="true"
        :disabled="disabled"
        switch
      ></CheckComp>
    </template>
  </TableComp>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameBoxScore } from '@/types/games'
import TableComp from '@/components/TableComp.vue'
import type { TableField, TableItem } from '@/types/comp-table'
import InputComp from '@/components/InputComp.vue'
import CheckComp from '@/components/CheckComp.vue'

import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import type { PlayerId } from '@/types/players'
import { useRoute } from 'vue-router'
import type { StatKey } from '@/types/stats'
import useCompetitionsLib from '@/composable/useCompetitionsLib'
import useOptionsLib from '@/composable/useOptionsLib'

const route = useRoute()
const { competitionId } = route.params

const { getPlayerName } = useLibs()
const { getPlayerNumber } = useCompetition(competitionId)
const { statsKeys: statsFieldsAll } = useOptionsLib()

interface IProps {
  modelValue: GameBoxScore
  trackedStats?: StatKey[]
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  trackedStats: () => [],
  disabled: false
})

const statsFields = computed(() =>
  statsFieldsAll
    .filter((opt) => Array.isArray(props.trackedStats) && props.trackedStats.includes(opt.value))
    .map((opt) => ({
      key: opt.value,
      label: opt.text
    }))
)
const fields = computed<TableField[]>(() => [
  { key: 'number', label: '#' },
  { key: 'name', label: 'Players' },
  ...statsFields.value,
  { key: 'dnp', label: '' }
])

const emit = defineEmits(['update:modelValue', 'input'])

const model = computed({
  get: (): GameBoxScore => props.modelValue,
  set: (val: GameBoxScore) => emit('update:modelValue', val)
})

const items = computed((): TableItem[][] => {
  return model.value
    ? Object.keys(model.value)?.map((playerId: PlayerId): TableItem[] => {
        return {
          id: playerId,
          number: getPlayerNumber(playerId),
          name: getPlayerName(playerId),
          ...model.value[playerId]
        }
      })
    : []
})
</script>
