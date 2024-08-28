<script lang="ts" setup>
import { ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import type { Option } from '@/types/comp-fields'

interface IProps {
  teamsOptions?: Option[]
  isBusy?: boolean
  disabled?: boolean
}
withDefaults(defineProps<IProps>(), {
  isBusy: false,
  disabled: false,
  teamsOptions: () => []
})

type FormData = {
  id: string
  sponsor: string
}
const getDefaultData = (): FormData => ({
  id: '',
  sponsor: ''
})
const data = ref<FormData>(getDefaultData())

const emit = defineEmits(['submit'])
const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
  emit('submit', data.value)
  data.value = getDefaultData()
}
</script>
<template>
  <form @submit="handleSubmit" class="d-flex align-items-end gap-2">
    <FieldComp label="Team" class="flex-grow-1">
      <TypeaheadSelectComp
        v-model="data.id"
        :options="teamsOptions"
        :disabled="isBusy || disabled"
        required
      />
    </FieldComp>
    <div class="mb-3">
      <ButtonComp variant="primary" type="submit" :disabled="disabled" :is-busy="isBusy"
        >Add</ButtonComp
      >
    </div>
  </form>
</template>
