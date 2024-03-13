<script lang="ts" setup>
import { ref, computed } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import type { Option } from '@/types/comp-fields'
import InputComp from '@/components/InputComp.vue'
import SelectComp from '@/components/SelectComp.vue'
import useLibs from '@/composable/useLibs'

interface IProps {
  teamsOptionsByGroups?: Option[][]
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isBusy: false,
  teamsOptionsByGroups: () => []
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

const { getTeamName } = useLibs()
const gameTeamsOptions = computed(() => {
  const selectedTeamId = data.value.teams.find(Boolean)
  const selectedGroup = props.teamsOptionsByGroups
    .find((group: Option[]) => group.find((opt: Option) => opt.value === selectedTeamId))
  return !selectedGroup 
    ? props.teamsOptionsByGroups.flat()
    : selectedGroup.filter((opt: Option) => !data.value.teams.includes(opt.value))
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
      <template v-if="!data.teams[0]">
        <SelectComp
          v-model="data.teams[0]"
          :options="gameTeamsOptions"
          placeholder="Select team..."
          required
        />
      </template>
      <template v-else>
        <div class="input-group">
          <div class="form-control text-bg-light">{{ getTeamName(data.teams[0]) }}</div>
          <ButtonComp variant="light" class="border flex-grow-0" @click="data.teams.splice(0, 1)"
            ><div class="btn-close"></div
          ></ButtonComp>
        </div>
      </template>
      <template v-if="!data.teams[1]">
        <SelectComp
          v-model="data.teams[1]"
          :options="gameTeamsOptions"
          placeholder="Select team..."
          required
        />
      </template>
      <template v-else>
        <div class="input-group">
          <div class="form-control text-bg-light">{{ getTeamName(data.teams[1]) }}</div>
          <ButtonComp variant="light" class="border flex-grow-0" @click="data.teams.splice(1, 1)"
            ><div class="btn-close"></div
          ></ButtonComp>
        </div>
      </template>
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
