<template>
  <div
    class="row row-cols-1 g-2"
    :class="{ 'row-cols-md-2': model.length >= 2, 'row-cols-lg-3': model.length >= 3 }"
  >
    <template v-for="(group, gIdx) in model" :key="gIdx">
      <div class="col">
        <div class="card">
          <div class="card-header text-center">
            <strong>Group {{ gIdx + 1 }}</strong>
          </div>
          <ul class="list-group list-group-flush">
            <template v-for="teamId in group" :key="teamId">
              <li class="list-group-item d-flex justify-content-between gap-3">
                <span>{{ getTeamName(teamId) }}</span>
                <ButtonComp
                  variant="light"
                  size="sm"
                  class="btn-close"
                  @click="() => handleRemoveTeam(gIdx, teamId)"
                />
              </li>
            </template>
            <li class="list-group-item">
              <SelectComp
                v-model="model[gIdx][model[gIdx].length]"
                :options="props.options"
                placeholder="Add team..."
                :disabled="!props.options.length"
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

const { getTeamName } = useLibs()

interface IProps {
  modelValue: TeamId[][]
  options: Option[]
  isEdit?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  options: () => [],
  isEdit: false
})

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: (): TeamId[][] => props.modelValue,
  set: (val: TeamId[][]) => emit('update:modelValue', val.map(group => group.filter(Boolean)))
})

const handleRemoveTeam = (gIdx: number, tId: TeamId) => {
  const newValue = model.value.slice()
  const idx = newValue[gIdx].findIndex((teamId: TeamId) => teamId === tId)
  newValue[gIdx].splice(idx, 1)
  model.value = newValue
}
</script>
