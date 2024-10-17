<template>
  <form @submit="handleSubmit">
    <template v-if="!!props.value && !!data">
      <h5>{{ getPlayerName(props.value?.id) }}</h5>
      <FieldComp label="Number" :invalidFeedback="errors.number">
        <InputComp v-model="data.number" :isInvalid="Boolean(errors.number)" />
      </FieldComp>
    </template>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit">Save</ButtonComp>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import InputComp from '@/components/InputComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import type { CompetitionPlayer, PlayerId } from '@/types/player'
import useLibs from '@/composable/useLibs'

interface IProps {
  value: CompetitionPlayer | undefined
  teamPlayers?: CompetitionPlayer[]
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  teamPlayers: () => [],
  isBusy: false
})

const getDefaultData = (): FormData => ({
  number: ''
})
type FormData = {
  number?: string
}

const data = ref<FormData | undefined>()
const errors = ref<{ [key: string]: undefined | string }>({})

const emit = defineEmits(['submit'])

watch(
  () => props.value,
  () => {
    delete errors.value.number
    data.value = {
      ...getDefaultData(),
      number: props.value?.number
    }
  }
)
const { getPlayerName } = useLibs()
const handleSubmit = (ev: Event) => {
  ev.preventDefault()
  if (props.value) {
    if (props.teamPlayers.findIndex((row) => row.number === data.value.number) > -1) {
      errors.value.number = 'This number is already taken.'
    } else {
      emit('submit', {
        ...data.value,
        id: props.value.id as PlayerId
      })
    }
  }
}
</script>

<style scoped lang="scss"></style>
