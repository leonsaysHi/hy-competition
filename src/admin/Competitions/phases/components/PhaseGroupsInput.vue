<template>
  <div
    class="row row-cols-1 g-2"
    :class="{ 'row-cols-md-2': model.length >= 2, 'row-cols-lg-3': model.length >= 3 }"
  >
    <template v-for="(group, gIdx) in model" :key="gIdx">
      <div class="col">
        <div class="card">
          <div class="card-header text-center">
            <FieldComp label="Group name">
              <InputComp type="text" v-model="model[gIdx].title" />
            </FieldComp>
          </div>
          <ul class="list-group list-group-flush">
            <template v-for="teamId in group.teams" :key="teamId">
              <li class="list-group-item d-flex justify-content-between gap-3">
                <span>{{ getTeamName(teamId) }}</span>
                <ButtonComp
                  variant="light"
                  size="sm"
                  class="btn-close"
                  :disabled="disabled"
                  @click="() => handleRemoveTeam(gIdx, teamId)"
                />
              </li>
            </template>
            <li class="list-group-item">
              <SelectComp
                v-model="model[gIdx].teams[model[gIdx].teams.length]"
                :options="props.options"
                placeholder="Add team..."
                :disabled="!props.options.length || disabled"
              />
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TeamId } from '@/types/teams'
import SelectComp from '@/components/SelectComp.vue'
import type { Option } from '@/types/comp-fields'
import useLibs from '@/composable/useLibs'
import ButtonComp from '@/components/ButtonComp.vue'
import type { PhaseGroup } from '@/types/competitions'
import InputComp from '@/components/InputComp.vue'
import FieldComp from '@/components/FieldComp.vue'

const { getTeamName } = useLibs()

interface IProps {
  modelValue: PhaseGroup[]
  options: Option[]
  isEdit?: boolean
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  options: () => [],
  isEdit: false,
  disabled: false
})

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: (): PhaseGroup[] => props.modelValue,
  set: (val: PhaseGroup[]) =>
    emit(
      'update:modelValue',
      val.map((group) => group.teams.filter(Boolean))
    )
})

const handleRemoveTeam = (gIdx: number, tId: TeamId) => {
  const groupTeamsList = model.value[gIdx].teams
  const newTeamsList = groupTeamsList.slice()
  const idx = newTeamsList.findIndex((teamId: TeamId) => teamId === tId)
  newTeamsList.splice(idx, 1)
  model.value[gIdx].teams = newTeamsList
}
</script>
