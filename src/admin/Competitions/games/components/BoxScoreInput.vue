<script setup lang="ts">
import { computed } from 'vue'
import type { GameDocBoxScore } from '@/types/games'
import TableComp from '@/components/TableComp.vue'
import type { TableField, TableItem } from '@/types/comp-table'
import InputComp from '@/components/InputComp.vue'
import CheckComp from '@/components/CheckComp.vue'

import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import type { Option } from '@/types/comp-fields'
import type { PlayerId } from '@/types/players'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params

const { getPlayerName } = useLibs()
const { getPlayerNumber,  trackedPlayerStatsKey } = useCompetition(competitionId)

interface IProps {
  modelValue: GameDocBoxScore
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const fields = computed<TableField[]>(() => {
  return [
    { key: 'number', label: '' },
    { key: 'name', label: 'Players' },
    ...trackedPlayerStatsKey.value.map(({ value: key, text: label }: Option) => (
      { key, label }
    ))
  ] 
})

const emit = defineEmits(['update:modelValue', 'input'])

const model = computed({
  get: (): GameDocBoxScore => props.modelValue,
  set: (val: GameDocBoxScore) => emit('update:modelValue', val)
})

const items = computed((): TableItem[] => {
  const result = model.value
    ? Object.keys(model.value)
      .map((playerId: PlayerId): TableItem => {
        return {
          id: playerId,
          number: getPlayerNumber(playerId),
          name: getPlayerName(playerId),
          ...model.value[playerId]
        }
      })
    : []
  result.sort((a, b) => Number(a.number) - Number(b.number))
  return result
})
</script>

<template>
  <TableComp :items="items" :fields="fields" small>
    <template #number="{ value }"
      ><div class="lh-1 fw-bold text-end">#{{ value }}</div></template
    >
    <template #name="{ value }"
      ><div class="lh-1">{{ value }}</div></template
    >
    <template #sec="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #fta="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #ftm="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #fga="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #fgm="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #fg3a="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #fg3m="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #dreb="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #oreb="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #ast="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #stl="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #blk="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #blka="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #tov="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #fcm="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #fdr="{ key, item }">
      <InputComp
        v-model="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp === 1 || disabled"
      />
    </template>
    <template #dnp="{ key, item }">
      <CheckComp
        v-model="model[item.id][key]"
        :value="1"
        :uncheck-value="0"
        :disabled="disabled"
        switch
      ></CheckComp>
    </template>
  </TableComp>
</template>
