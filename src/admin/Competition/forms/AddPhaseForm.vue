<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import SelectComp from '@/components/SelectComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import type { Option } from '@/types/comp-fields'
import InputComp from '@/components/InputComp.vue'
import PhaseGroupsInput from '@/admin/competition/phases/components/PhaseGroupsInput.vue'
import type { CompetitionPhase } from '@/types/competitions'
import type { TeamId } from '@/types/teams'
import type { GameId } from '@/types/games'
import ButtonComp from '@/components/ButtonComp.vue'

interface IProps {
  teamsOptions: Option[]
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isBusy: false
})

type FormData = {
  type: CompetitionPhase
  groups: TeamId[][]
  games: GameId[]
}
const getDefaultData = (): FormData => ({
  type: undefined,
  groups: [],
  games: []
})
const groupsLength = ref(1)
const data = ref<FormData>(getDefaultData())
const groupLengthMax = computed(() => (data.value.type === 'groups' ? 4 : 2))

const phasesOptions = [
  { text: 'Groups', value: 'groups' },
  { text: 'Playoffs', value: 'playoffs' }
]
const unassignedTeamsOptions = computed(() => {
  const assignedTeams = data.value.groups.flat()
  return props.teamsOptions.filter((opt: Option) => !assignedTeams.includes(opt.value))
})

watch(
  () => groupsLength.value,
  () => {
    const newGroups = []
    let idx = 0
    while (idx < groupsLength.value) {
      const gr = data.value.groups[idx] || []
      newGroups.push(gr.slice())
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
    <div class="row">
      <div class="col">
        <FieldComp label="Phase type">
          <SelectComp
            v-model="data.type"
            :options="phasesOptions"
            placeholder="Select phase..."
            @change="groupsLength = 1"
            required
          />
        </FieldComp>
      </div>
      <div class="col">
        <FieldComp label="Number of groups">
          <InputComp v-model="groupsLength" type="number" :min="1" :max="groupLengthMax" required />
        </FieldComp>
      </div>
    </div>
    <FieldComp label="Groups">
      <PhaseGroupsInput
        v-model="data.groups"
        :groupsLength="groupsLength"
        :options="unassignedTeamsOptions"
        is-edit
      />
    </FieldComp>
    <div class="d-flex justify-content-end">
      <ButtonComp type="submit" variant="primary" :disabled="!!unassignedTeamsOptions.length"
        >Start new phase</ButtonComp
      >
    </div>
  </form>
</template>
