<template>
  <div>
    <template v-for="(award, idx) in model" :key="idx">
      <h6 class="d-flex gap-3">
        <span>{{ getPlayerName(award.id) }}</span>
        <span class="badge bg-warning">{{ awards[award.value] }}</span>
        <ButtonComp variant="danger" class="btn-close" size="sm" @click="() => handleDelete(idx)"></ButtonComp>
      </h6>
    </template>
    <form class="d-flex align-items-end gap-3" @submit="handleAdd">
      <FieldComp label="Add award:" class="flex-grow-1">
        <SelectComp v-model="data.award" :options="awardsOptions" placeholder="Award..." required />
      </FieldComp>
      <FieldComp label="to player:" class="flex-grow-1">
        <TypeaheadSelectComp
          v-model="data.playerId"
          :options="playersOptions"
          placeholder="Player..."
          required
        />
      </FieldComp>

      <FieldComp>
        <ButtonComp variant="primary" type="submit">Add</ButtonComp>
      </FieldComp>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PlayerId, CompetitionPlayer } from '@/types/players'
import type { CompetitionTeam } from '@/types/teams'
import type { Award, AwardItem } from '@/types/stats'
import type { Option } from '@/types/comp-fields'
import ButtonComp from '@/components/ButtonComp.vue'

import FieldComp from '@/components/FieldComp.vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import SelectComp from '@/components/SelectComp.vue'
import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import { useRoute } from 'vue-router'

interface IProps {
  modelValue: AwardItem[]
}
const props = withDefaults(defineProps<IProps>(), {})

type FormData = {
  playerId: PlayerId | undefined
  award: Award | undefined
}

const route = useRoute()
const { competitionId } = route.params

const getDefaultData = (): FormData => ({
  playerId: undefined,
  award: undefined
})
const data = ref(getDefaultData())
const { row: competition } = useCompetition(competitionId)
const { getPlayerName } = useLibs()

const awards: { [key: Award]: string } = {
  mvp: 'MVP',
  def: 'Defensive player'
}
const awardsOptions = computed((): Option[] => {
  return Object.keys(awards).map(
    (value: Award) => ({
      text: awards[value],
      value
    })
  )
})
const playersOptions = computed((): Option[] => {
  const competitionPlayersList: PlayerId[] =
    competition?.value?.teams?.reduce((list: PlayerId[], team: CompetitionTeam) => {
      return [...list, ...team.players.map((player: CompetitionPlayer) => player.id)]
    }, []) || []
  return competitionPlayersList.map(
    (playerId: PlayerId): Option => ({
      text: getPlayerName(playerId),
      value: playerId
    })
  )
})

const emit = defineEmits(['update:modelValue', 'input'])
const model = computed({
  get: (): AwardItem[] => props.modelValue,
  set: (val: AwardItem[]) => emit('update:modelValue', val)
})

const handleDelete = (idx) => {
  const newValue = model.value.slice()
  newValue.splice(idx, 1)
  model.value = newValue
}
const handleAdd = (ev: Event) => {
  ev.preventDefault()
  model.value.push(
    { 
      id: data.value.playerId,
      value: data.value.award 
    } as AwardItem
  )
  data.value = getDefaultData()
}
</script>

<style scoped lang="scss">
.scores {
  display: grid;
  column-gap: 0.25rem;
  row-gap: 0.25rem;
  grid-template-columns: 3rem 1fr auto 1fr 3rem;
  .add {
    grid-column-start: 2;
    grid-column-end: span 3;
  }
}
</style>
