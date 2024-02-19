<template>
  <form @submit="handleSubmit" class="d-flex align-items-end gap-2">
    <FieldComp label="Number">
      <InputComp v-model="data.number" placeholder="#" required />
    </FieldComp>
    <FieldComp label="Player" class="flex-grow-1">
      <TypeaheadSelectComp
        v-model="data.id"
        :options="playersOptions"
        placeholder="Player"
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

interface IProps {
  playersOptions: Option[]
  isBusy?: boolean
}
withDefaults(defineProps<IProps>(), {
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

const emit = defineEmits(['submit'])
const handleSubmit = (ev: Event) => {
  ev.preventDefault()
  emit('submit', data.value)
  data.value = {
    ...getDefaultData()
  }
}
</script>

<style scoped lang="scss"></style>
