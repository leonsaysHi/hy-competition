<template>
  <div>
    <template v-for="(award, playerId) in model" :key="idx">
      <h6 class="d-flex gap-3">{{ getPlayer(playerId) }}<span class="badge bg-warning">{{ awards[award] }}</span></h6>
    </template>
    <form class="d-flex align-items-end gap-3" @submit="handleAddAward">
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
</template>, toValue

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { PlayerId, Player, CompetitionPlayer } from '@/types/players'
import type { CompetitionTeam } from '@/types/teams'
import type { Award, Awards } from '@/types/stats'
import type { Option } from '@/types/comp-fields'
import ButtonComp from '@/components/ButtonComp.vue'
import type { findAncestor } from 'typescript'
import FieldComp from '@/components/FieldComp.vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import SelectComp from '@/components/SelectComp.vue'
import { PlayersLibKey, CompetitionKey } from '@/types/symbols'

interface IProps {
  modelValue: Awards[]
}
const props = withDefaults(defineProps<IProps>(), {})

type FormData = {
  playerId: PlayerId | undefined
  award: Award | undefined
}

const getDefaultData = (): FormData => ({
  playerId: undefined,
  award: undefined
})
const data = ref(getDefaultData())
const competition = inject(CompetitionKey)
const playersLib = inject(PlayersLibKey)

const awards: { [key: Award]: string } = {
  mvp: 'MVP',
  def: 'Defensive player'
}
const awardsOptions = computed((): Option[] => {
  const awardsList: Award[] = Object.keys(awards)
  return awardsList
    .map((val: Award): Option => ({
      text: awards[val],
      value: val
    }))
})
const playersOptions = computed((): Option[] => {
  const competitionPlayersList: PlayerId[] = competition.value.teams.reduce((list, team: CompetitionTeam) => {
    return [
      ...list,
      ...team.players.map((player: CompetitionPlayer) => player.id)
    ]
  }, [])
  const playersList: Player[] = competitionPlayersList
    .map(
      (playerId: PlayerId): Player => playersLib?.value.find((row) => row.id === playerId)
    )
  return playersList
    .map(
      (player: Player): Option => ({
        text: `${player.fname} ${player.lname}`,
        value: player.id
      })
    )
})

const getPlayer = (playerId) => playersOptions.value.find((opt) => opt.value === playerId).text
const emit = defineEmits(['update:modelValue', 'input'])
const model = computed({
  get: (): Awards => props.modelValue,
  set: (val: Awards) => emit('update:modelValue', val)
})

const handleAddAward = (ev: Event) => {
  ev.preventDefault()
  model.value = {
    ...model.value,
    [data.value.playerId]: data.value.award
  }
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
