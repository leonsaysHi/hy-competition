<template>
  <div class="mb-3">
    {{  model }}
    {{  items  }}
    <TableComp :fields="fields" :items="items">
      <template #number="{ item }">{{ item.number }}</template>
      <template #id="{ item }">{{ showPlayer(item).fname }}{{ showPlayer(item).lname }}</template>
      <template #identification="{ item }">{{ showPlayer(item).identification }}</template>
    </TableComp>
    <TypeaheadSelectComp 
      v-model="addPlayer" 
      :options="options"
      placeholder="Player"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, watch } from 'vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import { PlayersKey } from '@/types/symbols'
import TableComp from '@/components/TableComp.vue'
import type { TableField, TableItem } from '@/types/comp-table'
import type { CompetitionPlayer, Player, PlayerId } from '@/types/players'
import type { Option } from '@/types/comp-fields'
import type { CompetitionTeam } from '@/types/teams'

const playersLib = inject(PlayersKey)
interface IProps {
  modelValue: CompetitionPlayer[]
  options: Option[]
}
const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => [],
  options: () => [],
})
const addPlayer = ref(undefined)
watch(
  () => addPlayer.value,
  (playerId) => {
    if (playerId) {
      model.value.push(playerId)
    } 
  }
)

const fields: TableField[] = [
  {
    key: 'id',
    label: 'Players'
  },
  {
    key: 'identification',
    label: 'Identification'
  },
  {
    key: 'actions',
    label: ''
  }
]

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: ():CompetitionPlayer[] => props.modelValue,
  set: (val: CompetitionPlayer[]) => emit('update:modelValue', val)
})
const items = computed(():TableItem[]=>{
  return model.value.map((row: CompetitionPlayer) => {
    const { fname, lname, dob, identification }: Player | undefined = playersLib?.value?.find(p => row.id === p.id)
    return {
      fname, 
      lname, 
      dob, 
      identification,
      ...row,
    } as TableItem
  })
})
const showPlayer = (playerid: PlayerId) => {
  return playersLib?.value?.find(p => player.id === p.id)
}
</script>

<style scoped lang="scss"></style>
