<template>
  <form @submit="handleSubmit" class="d-flex align-items-end gap-2">
    <FieldComp label="Number" :invalidFeedback="errors.number">
      <InputComp
        v-model="data.number"
        placeholder="#"
        :isInvalid="Boolean(errors.number)"
        required
      />
    </FieldComp>
    <FieldComp label="Player" class="flex-grow-1">
      <TypeaheadSelectComp
        v-model="data.id"
        :options="playersOptions"
        placeholder="Player"
        direction="up"
        required
      />
    </FieldComp>
    <div class="mb-3">
      <ButtonComp variant="primary" type="submit" :disabled="!data.id">Add</ButtonComp>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'

import InputComp from '@/components/InputComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import type { Option } from '@/types/comp-fields'
import type { CompetitionPlayer } from '@/types/players'

interface IProps {
  playersOptions: Option[]
  teamPlayers?: CompetitionPlayer[]
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  teamPlayers: () => [],
  isBusy: false
})

type FormData = {
  id?: string
  number?: string
}
const getDefaultData = (): FormData => ({
  id: '',
  number: ''
})
const data = ref<FormData>(getDefaultData())
const errors = ref<{ [key: string]: undefined | string }>({})

const emit = defineEmits(['submit'])
const handleSubmit = (ev: Event) => {
  ev.preventDefault()

  if (props.teamPlayers.findIndex((row) => row.number === data.value.number) > -1) {
    errors.value.number = 'This number is already taken.'
  } else {
    emit('submit', data.value)
    data.value = {
      ...getDefaultData()
    }
    delete errors.value.number
  }
}
</script>

<style scoped lang="scss"></style>
