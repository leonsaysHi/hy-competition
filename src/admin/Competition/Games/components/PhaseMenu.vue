<script lang="ts" setup>
import type { Phase } from '@/types/competitions'
import { computed } from 'vue'
import type { Option } from '@/types/comp-fields'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
interface IProps {
  modelValue: string
  phases: Phase[]
}
const props = withDefaults(defineProps<IProps>(), {})

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const phasesOptions = computed((): Option[] => {
  const result = Array.isArray(props.phases)
    ? props.phases.map(
        (phase: Phase, idx: number): Option => ({
          text: `${phase.type}`,
          value: idx.toString()
        })
      )
    : []
  return [{ text: 'All', value: '' }, ...result]
})
</script>
<template>
  <div class="d-flex gap-3">
    <strong>Phase:</strong>
    <div class="d-flex gap-1">
      <RadioGroupComp
        v-model="model"
        :options="phasesOptions"
        :disabled="props.phases.length === 1"
        buttons
      />
    </div>
  </div>
</template>
