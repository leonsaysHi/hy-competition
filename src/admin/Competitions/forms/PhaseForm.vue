<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import SelectComp from '@/components/SelectComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import type { Option } from '@/types/comp-fields'
import InputComp from '@/components/InputComp.vue'
import PhaseGroupsInput from '@/admin/Competitions/phases/components/PhaseGroupsInput.vue'
import type { PhaseGroup, PhaseType } from '@/types/competitions'
import type { TeamId } from '@/types/team'
import ButtonComp from '@/components/ButtonComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import AlertComp from '@/components/AlertComp.vue'

interface IProps {
  value: FormData | undefined
  teamsOptions: Option[]
  isBusy?: boolean
  isGroupDisabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isBusy: false,
  isGroupDisabled: false
})

type FormData = {
  title: String
  type: PhaseType
  groups: PhaseGroup[]
  datetime: Date
}
const getDefaultData = (): FormData => ({
  title: '',
  type: undefined,
  groups: [],
  datetime: new Date()
})


const groupsLength = ref(
  Math.max(
    1, 
    Array.isArray(props.value?.groups) 
      ? props.value.groups.length
      : 1
  )
)
const data = ref<FormData>({
  ...getDefaultData(),
  ...props.value
})

const groupLengthMax = computed(() => (data.value.type === 'groups' ? 4 : 2))

const { competitionPhases: phasesOptions } = useOptionsLib()

const unassignedTeamsOptions = computed(() => {
  const assignedTeams = data.value.groups.reduce((acc: TeamId[], gr:PhaseGroup) => {
    return [...acc, ...gr.teams]
  }, [])
  return props.teamsOptions.filter((opt: Option) => !assignedTeams.includes(opt.value))
})

watch(
  () => groupsLength.value,
  () => {
    const newGroups = []
    let idx = 0
    while (idx < groupsLength.value) {
      const gr = data.value.groups[idx] || { name: `Group ${idx + 1}`, teams: [] }
      newGroups.push({ ...gr })
      idx++
    }
    data.value.groups = newGroups
  },
  { immediate: true }
)
const emit = defineEmits(['submit'])
const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
  emit('submit', data.value)
}
</script>
<template>
  <form @submit="handleSubmit">
    <FieldComp label="Phase type">
      <SelectComp
        v-model="data.type"
        :options="phasesOptions"
        placeholder="Select phase..."
        @change="groupsLength = 1"
        required
      />
    </FieldComp>
    <div class="row row-cols-2">
      <div>
        <FieldComp label="Title">
          <InputComp v-model="data.title" :disabled="isBusy" required />
        </FieldComp>
      </div>
      <div>
        <FieldComp label="Start date">
          <InputComp v-model="data.datetime" type="datetime-local" :disabled="isBusy" required />
        </FieldComp>
      </div>
    </div>
    <hr />
    <div class="row row-cols-2">
      <div>
        <FieldComp label="Number of groups">
          <InputComp v-model="groupsLength" :disabled="isGroupDisabled || isBusy" type="number" :min="1" :max="groupLengthMax" required />
        </FieldComp>
      </div>
    </div>
    <FieldComp label="Groups">
      <PhaseGroupsInput
        v-model="data.groups"
        :groupsLength="groupsLength"
        :options="unassignedTeamsOptions"
        :disabled="isGroupDisabled || isBusy"
        is-edit
      />
    </FieldComp>

    <div class="d-flex justify-content-end align-items-center gap-3">
      <template v-if="!!unassignedTeamsOptions.length">
        <AlertComp variant="warning" size="sm" class="mb-0"
          >{{ unassignedTeamsOptions.length }} unassigned teams.</AlertComp
        >
      </template>
      <ButtonComp type="submit" variant="primary" :disabled="isBusy">Save</ButtonComp>
    </div>
  </form>
</template>
