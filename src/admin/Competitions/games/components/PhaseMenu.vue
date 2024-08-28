<script lang="ts" setup>
import type { Phase } from '@/types/competitions'
import { computed } from 'vue'
import type { Option } from '@/types/comp-fields'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
interface IProps {
  modelValue: number | undefined
  phases: Phase[] | undefined
}
const props = withDefaults(defineProps<IProps>(), {})

const { competitionPhases } = useOptionsLib()

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const phasesOptions = computed((): Option[] => {
  const result = Array.isArray(props.phases)
    ? props.phases.map((phase: Phase, idx: number): Option => {
        const opt = competitionPhases.find((opt: Option) => opt.value === phase.type)
        return {
          text: opt ? opt.text : (phase.type as string),
          value: idx
        }
      })
    : []
  return [{ text: 'All', value: undefined }, ...result]
})
</script>
<template>
  <div class="hstack gap-3">
    <strong>Phase:</strong>
    <div class="d-flex gap-1">
      <RadioGroupComp
        v-model="model"
        :options="phasesOptions"
        :disabled="phasesOptions.length === 2"
        buttons
      />
    </div>
  </div>
</template>
