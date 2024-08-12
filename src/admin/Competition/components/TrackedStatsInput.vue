<template>
  <CheckGroupComp
    v-model="model"
    :options="statsOptions"
    :disabled="disabled"
    buttons
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CheckGroupComp from '@/components/CheckGroupComp.vue'
import type { PlayerStatKey, PlayerTrackedStatKey, StatsGroupDef, StatsGroupValue } from '@/types/stats';
import type { Option } from '@/types/comp-fields';
import useOptionsLib from '@/composable/useOptionsLib';

const {
  competitionStatsGroups: statsGroups
} = useOptionsLib()

interface IProps {
  modelValue: PlayerStatKey[]
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  playersOptions: () => [],
  disabled: false
})

const model = computed({
  get: (): [] => {
    return statsGroups
      .filter((group: StatsGroupDef) => group.value)
      .reduce((acc: StatsGroupValue[], group: StatsGroupDef) => {
        const isSelected = group.keys.some((k:PlayerTrackedStatKey) => props.modelValue.includes(k))
        if (isSelected) {
          acc.push(group.value as StatsGroupValue)
        }
        return acc
      }, []) as []
  },
  set: (val: StatsGroupValue[]) => {
    const newVal: PlayerTrackedStatKey[] = val
        .reduce(
          (acc: PlayerTrackedStatKey[], key: StatsGroupValue) => {
            const group = statsGroups.find((group: StatsGroupDef) => key === group.value)
            return [
              ...acc,
              ...(group ? group.keys : [])
            ]
          }, 
          statsGroups.find((group: StatsGroupDef) => !group.value)?.keys || []
        )
    emit('update:modelValue', newVal)
  }
})

const emit = defineEmits(['update:modelValue', 'input'])
const statsOptions = computed(() => {
  return statsGroups.reduce((options:Option[], group: StatsGroupDef) => {
    if (group.value) {
      options.push({ text: group.text as string, value: group.value })
    }
    return options
  }, [])
})
</script>

