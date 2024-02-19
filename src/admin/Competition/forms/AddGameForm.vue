<script lang="ts" setup>
import { ref, computed } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import type { Option } from '@/types/comp-fields'
import InputComp from '@/components/InputComp.vue'

interface IProps {
  teamsOptions?: Option[]
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isBusy: false,
  teamsOptions: () => []
})

type FormData = {
  teams: []
  datetime: string
  scores: {}
  boxscore: {}
  awards: []
}
const getDefaultData = (): FormData => ({
  teams: [],
  datetime: '',
  scores: {},
  boxscore: {},
  awards: []
})
const data = ref<FormData>(getDefaultData())

const gameTeamsOptions = computed(() => {
  return props.teamsOptions.map((opt: Option) => ({
    ...opt,
    disabled: data.value.teams.includes(opt.value)
  }))
})
const emit = defineEmits(['submit'])
const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
  emit('submit', data.value)
  data.value = getDefaultData()
}
</script>
<template>
  <form @submit="handleSubmit" class="d-flex align-items-end gap-2">
    <FieldComp label="Teams" class="flex-grow-1 d-flex flex-column gap-1">
      <TypeaheadSelectComp
        v-model="data.teams[0]"
        :options="gameTeamsOptions"
        placeholder="Select team..."
        required
      />
      <TypeaheadSelectComp
        v-model="data.teams[1]"
        :options="gameTeamsOptions"
        placeholder="Select team..."
        required
      />
    </FieldComp>
    <FieldComp label="Date" class="flex-grow-0 d-flex flex-column gap-1">
      <InputComp
        v-model="data.datetime"
        type="datetime-local"
        placeholder="Select date..."
        required
      />
      <ButtonComp variant="primary" type="submit" class="align-self-end">Add</ButtonComp>
    </FieldComp>
  </form>
</template>
