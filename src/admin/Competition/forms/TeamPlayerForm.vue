<template>
  <form @submit="handleSubmit">
    <h5>{{ player.fname }} {{ player.lname }}</h5>
    <FieldComp label="Number">
      <InputComp v-model="data.number" />
    </FieldComp>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit">Save</ButtonComp>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import InputComp from '@/components/InputComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'

interface IProps {
  value: FormData
  player: Player
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isBusy: false
})

type FormData = {
  number?: string
}
const data = ref<FormData>({
  number: '',

  ...props.value
})

const emit = defineEmits(['submit'])

const handleSubmit = (ev: Event) => {
  ev.preventDefault()
  emit('submit', data.value)
}
</script>

<style scoped lang="scss"></style>
