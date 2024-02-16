<template>
  <template v-for="(teamId, idx) in game.teams" :key="teamId">
    <div>{{ teamId }}</div>
    <TableComp :items="items[idx]" :fields="fields" small>
      <template #id="{ value }"><div class="lh-1">{{ getPlayerName(value) }}</div></template>
      <template #pts="{ key, item }">
        <InputComp v-model="model[item.id][key]" type="number" size="sm" :disabled="model[item.id].dnp" />
      </template>
      <template #m3pts="{ key, item }">
        <InputComp v-model="model[item.id][key]" type="number" size="sm" :disabled="model[item.id].dnp" />
      </template>
      <template #reb="{ key, item }">
        <InputComp v-model="model[item.id][key]" type="number" size="sm" :disabled="model[item.id].dnp" />
      </template>
      <template #ast="{ key, item }">
        <InputComp v-model="model[item.id][key]" type="number" size="sm" :disabled="model[item.id].dnp" />
      </template>
      <template #stl="{ key, item }">
        <InputComp v-model="model[item.id][key]" type="number" size="sm" :disabled="model[item.id].dnp" />
      </template>
      <template #blk="{ key, item }">
        <InputComp v-model="model[item.id][key]" type="number" size="sm" :disabled="model[item.id].dnp" />
      </template>
      <template #to="{ key, item }">
        <InputComp v-model="model[item.id][key]" type="number" size="sm" :disabled="model[item.id].dnp" />
      </template>
      <template #pf="{ key, item }">
        <InputComp v-model="model[item.id][key]" type="number" size="sm" :disabled="model[item.id].dnp" />
      </template>
      <template #dnp="{ key, item }">
        <CheckComp v-model="model[item.id][key]" :value="false" :uncheck-value="true" switch></CheckComp>
      </template>
    </TableComp>
  </template>

</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { Game, GameBoxScore } from '@/types/games'
import TableComp from '@/components/TableComp.vue'
import { CompetitionKey } from '@/types/symbols'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer, Player, PlayerId } from '@/types/players';
import type { TableItem } from '@/types/comp-table'
import { useRoute } from 'vue-router'
import InputComp from '@/components/InputComp.vue'
import CheckComp from '@/components/CheckComp.vue'

import usePlayersLib from '@/composable/usePlayersLib'

const route = useRoute()
const { gameId } = route.params

const competition = inject(CompetitionKey)
const { rows: playersLib } = usePlayersLib()

const game: Game = competition?.value?.games?.find((game: Game) => game.id === gameId) || {} as Game

interface IProps {
  modelValue: GameBoxScore
  teams: TeamId[]
}
const props = withDefaults(defineProps<IProps>(), {})

const fields = [
  { key: 'number', label: '#' },
  { key: 'id', label: 'Players' },
  { key: 'pts', label: 'Pts' },
  { key: 'm3pts', label: '3Pts' },
  { key: 'reb', label: 'Reb' },
  { key: 'ast', label: 'Ast' },
  { key: 'stl', label: 'Stl' },
  { key: 'blk', label: 'Blk' },
  { key: 'to', label: 'To' },
  { key: 'pf', label: 'Pf' },
  { key: 'dnp', label: '' },
]

const emit = defineEmits(['update:modelValue', 'input'])
const model = computed({
  get: (): GameBoxScore => props.modelValue,
  set: (val: GameBoxScore) => emit('update:modelValue', val)
})
const getPlayerName = (playerId: PlayerId) => {
  const player: Player = playersLib?.value?.find((player: Player) => player.id === playerId) || {} as Player
  return `${player.fname} ${player.lname}`
}
const items = computed((): TableItem[][] => {
  return competition?.value.teams
    ?.filter((team: CompetitionTeam) => game.teams.includes(team.id))
      ?.map((team: CompetitionTeam): TableItem[] => {
        return team.players
          .map((player: CompetitionPlayer): TableItem => ({
            id: player.id,
            number: player.number,
            ...model.value[player.id],
          }))
      })
})

</script>


