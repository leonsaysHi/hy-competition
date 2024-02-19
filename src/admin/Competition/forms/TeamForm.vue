<script lang="ts" setup>
import { ref } from 'vue'
import FieldComp from '@/components/FieldComp.vue'
import InputComp from '@/components/InputComp.vue'

interface IProps {
  value: FormData
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isBusy: false
})

type FormData = {
  sponsor?: string
}
const data = ref<FormData>({
  sponsor: '',
  ...props.value
})

const emit = defineEmits(['submit'])

const handleSubmit = (ev: Event) => {
  ev.preventDefault()
  emit('submit', data.value)
}
</script>
<template>
  <form @submit="handleSubmit">
    <FieldComp label="Sponsor">
      <InputComp v-model="data.sponsor" />
    </FieldComp>
  </form>
</template>
