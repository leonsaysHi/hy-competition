<template>
  <template v-for="opt in options" :key="opt.value">
    <div :class="computedWrapperClass">
      <input
        :class="computedInputClass"
        type="radio"
        :name="`radio-input-${$.uid}`"
        :id="`radio-input-${$.uid}-${opt.value}`"
        :disabled="disabled"
        :checked="model === opt.value"
        @click="() => handleSelect(opt.value)"
      />
      <label 
        :class="computedLabelClass" 
        :for="`radio-input-${$.uid}-${opt.value}`"
      >
        {{ opt.text }}
      </label>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { Option } from '@/types/comp-fields'
import { computed } from 'vue'
interface IProps {
  modelValue: string
  options: Option[]
  placeholder?: string
  readonly?: boolean
  required?: boolean
  disabled?: boolean
  stacked?: boolean
  buttons?: boolean
  isValid?: boolean
  isInvalid?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  placeholder: '',
  readonly: false,
  required: false,
  disabled: false,
  stacked: false,
  buttons: false,
  isValid: false,
  isInvalid: false
})

const emit = defineEmits(['update:modelValue', 'change', 'validate'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})
const handleSelect = (val) => { model.value = val}
const computedWrapperClass = computed(() => {
  const result: string[] = []
  if (props.stacked) { 
    result.push('form-check')
  }
  return result
})
const computedInputClass = computed(() => {
  const result: string[] = []
  if (props.buttons) {
    result.push('btn-check')
  } else if (props.stacked) { 
    result.push('form-check-input')
  }
  return result
})
const computedLabelClass = computed(() => {
  const result: string[] = []
  if (props.buttons) {
    result.push('btn btn-sm')
  } else if (props.stacked) { 
    result.push('form-check-label')
  }
  return result
})
</script>
