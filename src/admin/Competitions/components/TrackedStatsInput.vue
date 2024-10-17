<template>
  <CheckGroupComp
    v-model="model"
    :options="statsOptions"
    :disabled="disabled"
    buttons
  />
  <p class="small text-body-tertiary">"Game played": mark player assistance for each games. "Field goal attemps": allow shooting % calculation.</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CheckGroupComp from '@/components/CheckGroupComp.vue'
import type { PlayerStatLineKey, StatsGroupDef, StatsGroupValue } from '@/types/player-stats';
import type { Option } from '@/types/comp-fields';
import { extraStatsGroups, defaultStatsKeys } from '@/utils/stats/basketball';



interface IProps {
  modelValue: PlayerStatLineKey[]
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  playersOptions: () => [],
  disabled: false
})

const model = computed<StatsGroupValue[]>({
  get: (): [] => {
    return extraStatsGroups
      .reduce((acc: StatsGroupValue[], group: StatsGroupDef) => {
        const isSelected = group.keys.some((k:PlayerStatLineKey) => props.modelValue.includes(k))
        if (isSelected) {
          acc.push(group.value as StatsGroupValue)
        }
        return acc
      }, []) as []
  },
  set: (val: StatsGroupValue[]) => {
    const newVal: PlayerStatLineKey[] = val
        .reduce(
          (acc: PlayerStatLineKey[], key: StatsGroupValue) => {
            const group = extraStatsGroups.find((group: StatsGroupDef) => key === group.value)
            return [
              ...acc,
              ...(group ? group.keys : [])
            ]
          }, 
          defaultStatsKeys
        )
    emit('update:modelValue', newVal)
  }
})

const emit = defineEmits(['update:modelValue', 'input'])
const statsOptions = computed(() => {
  return extraStatsGroups.reduce((options:Option[], group: StatsGroupDef) => {
    options.push({ 
      text: group.text as string, 
      value: group.value 
    })
    return options
  }, [])
})
</script>

