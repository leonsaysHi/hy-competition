<template>
  <div class="scores">
    <template v-for="(scores, teamId, idx) in model" :key="teamId">
      <template v-if="idx === 0"><div></div></template>
      <h6 class="text-truncate text-center">
        <template v-if="idx === 0"
          ><slot name="team1">{{ teamId }}</slot></template
        >
        <template v-else
          ><slot name="team2">{{ teamId }}</slot></template
        >
      </h6>
      <div></div>
    </template>
    <template v-for="(scores, teamId, idx) in model" :key="teamId">
      <template v-if="idx === 0"><div></div></template>
      <h5 class="text-center">{{ getTotal(scores) }}</h5>
      <div><template v-if="idx === 0">Final</template></div>
    </template>

    <template v-for="(period, periodIdx) in getPeriodsArray" :key="periodIdx">
      <template v-for="(scores, teamId, colIdx) in model" :key="colIdx">
        <div>
          <template v-if="!colIdx">{{ period }}</template>
          <template v-else
            ><ButtonComp
              variant="light"
              size="sm"
              :disabled="disabled"
              @click="handleRemovePeriod(periodIdx)"
              >Remove</ButtonComp
            ></template
          >
        </div>
        <div>
          <InputComp
            v-model="model[teamId][periodIdx]"
            type="number"
            :disabled="disabled"
            @update="(v) => handleInput(teamId, periodIdx, v)"
          />
        </div>
        <template v-if="colIdx"><div></div></template>
      </template>
    </template>

    <div class="add d-flex justify-content-center">
      <ButtonComp variant="light" size="sm" :disabled="disabled" @click="handleAddPeriod"
        >Add period</ButtonComp
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameDocScores } from '@/types/games'
import InputComp from '@/components/InputComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import type { TeamId } from '@/types/team'

interface IProps {
  modelValue: GameDocScores
  teams: TeamId[]
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const emit = defineEmits(['update:modelValue', 'input'])
const model = computed({
  get: (): GameDocScores => props.modelValue,
  set: (val: GameDocScores) => emit('update:modelValue', val)
})
const getTotal = (arr: number[]) => {
  return arr.reduce((tot, n) => tot + n, 0)
}
const getPeriodsArray = computed(() => {
  return Object.keys(model.value).length
    ? model.value[Object.keys(model.value)[0]].map((score, idx) =>
        idx < 4 ? `Q${idx + 1}` : `OT${idx - 3}`
      )
    : []
})
const handleInput = (teamId, idx, val) => {
  const newValue = { ...model.value }
  newValue[teamId][idx] = val
  emit('update:modelValue', newValue)
}
const handleAddPeriod = () => {
  const newValue = { ...model.value }
  Object.keys(newValue).forEach((teamId) => newValue[teamId].push(0))
  emit('update:modelValue', newValue)
}
const handleRemovePeriod = (idx: number) => {
  const newValue = { ...model.value }
  Object.keys(newValue).forEach((teamId) => newValue[teamId].splice(idx, 1))
  emit('update:modelValue', newValue)
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
