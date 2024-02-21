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
        :disabled="model[item.id].dnp"
      />
    </template>
    <template #m3pts="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp"
      />
    </template>
    <template #reb="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp"
      />
    </template>
    <template #ast="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp"
      />
    </template>
    <template #stl="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp"
      />
    </template>
    <template #blk="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp"
      />
    </template>
    <template #to="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp"
      />
    </template>
    <template #pf="{ key, item }">
      <InputComp
        v-model.number="model[item.id][key]"
        type="number"
        size="sm"
        :disabled="model[item.id].dnp"
      />
    </template>
    <template #dnp="{ key, item }">
      <CheckComp
        v-model="model[item.id][key]"
        :value="false"
        :uncheck-value="true"
        switch
      ></CheckComp>
    </template>
  </TableComp>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameBoxScore } from '@/types/games'
import TableComp from '@/components/TableComp.vue'
import type { TableItem } from '@/types/comp-table'
import InputComp from '@/components/InputComp.vue'
import CheckComp from '@/components/CheckComp.vue'

import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import type { PlayerId } from '@/types/players'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params

const { getPlayerName } = useLibs()
const { getPlayerNumber } = useCompetition(competitionId)

interface IProps {
  modelValue: GameBoxScore
}
const props = withDefaults(defineProps<IProps>(), {})

const fields = [
  { key: 'number', label: '#' },
  { key: 'name', label: 'Players' },
  { key: 'pts', label: 'Pts' },
  { key: 'm3pts', label: '3Pts' },
  { key: 'reb', label: 'Reb' },
  { key: 'ast', label: 'Ast' },
  { key: 'stl', label: 'Stl' },
  { key: 'blk', label: 'Blk' },
  { key: 'to', label: 'To' },
  { key: 'pf', label: 'Pf' },
  { key: 'dnp', label: '' }
]

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
