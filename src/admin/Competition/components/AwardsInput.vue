<template>
  <div>
    <AwardsList :items="model">
      <template #action="{ idx }">
        <ButtonComp
          variant="danger"
          class="btn-close"
          size="sm"
          :disabled="disabled"
          @click="() => handleDelete(idx)"
        ></ButtonComp>
      </template>
    </AwardsList>
    <form class="d-flex align-items-end gap-3" @submit="handleAdd">
      <FieldComp label="Add award:" class="flex-grow-1">
        <SelectComp
          v-model="data.award"
          :options="awardsKeys"
          placeholder="Award..."
          :disabled="disabled"
          required
        />
      </FieldComp>
      <FieldComp label="to player:" class="flex-grow-1">
        <TypeaheadSelectComp
          v-model="data.playerId"
          :options="playersOptions"
          placeholder="Player..."
          :disabled="disabled"
          required
        />
      </FieldComp>

      <FieldComp>
        <ButtonComp variant="primary" type="submit" :disabled="disabled">Add</ButtonComp>
      </FieldComp>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PlayerId } from '@/types/players'
import type { AwardKey, AwardItem } from '@/types/stats'
import type { Option } from '@/types/comp-fields'
import ButtonComp from '@/components/ButtonComp.vue'

import FieldComp from '@/components/FieldComp.vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import SelectComp from '@/components/SelectComp.vue'
import useLibs from '@/composable/useLibs'
import useOptionsLib from '@/composable/useOptionsLib'
import AwardsList from '@/components/competitions/AwardsList.vue'

interface IProps {
  modelValue: AwardItem[]
  playersOptions?: Option[]
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  playersOptions: () => [],
  disabled: false
})

type FormData = {
  playerId: PlayerId | undefined
  award: AwardKey | undefined
}

const getDefaultData = (): FormData => ({
  playerId: undefined,
  award: undefined
})
const data = ref(getDefaultData())
const { getPlayerName } = useLibs()

const { awardsKeys, getAward } = useOptionsLib()

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
  model.value.push({
    id: data.value.playerId,
    value: data.value.award
  } as AwardItem)
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
