<template>
  <input
    :id="`radio-input-${$.uid}-${value}`"
    :class="computedInputClass"
    type="radio"
    :name="`radio-input-${$.uid}`"
    :disabled="disabled || readonly"
    :required="required"
    :checked="model === value"
    @click="() => handleSelect(value)"
  />
  <label :class="computedLabelClass" :for="`radio-input-${$.uid}-${value}`">
    <slot></slot>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface IProps {
  modelValue: boolean | string | number | undefined
  value?: boolean | string | number | undefined
  readonly?: boolean
  required?: boolean
  disabled?: boolean
  buttons?: boolean
  buttonVariant?: string
  buttonSize?: 'sm' | 'md' | 'lg'
  isValid?: boolean
  isInvalid?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  placeholder: '',
  readonly: false,
  required: false,
  disabled: false,
  buttons: false,
  buttonVariant: 'primary',
  buttonSize: 'sm',
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
const handleSelect = (val: any) => {
  model.value = val
}
const computedInputClass = computed(() => {
  const result: string[] = []
  if (props.buttons) {
    result.push('btn-check')
  }
  return result
})
const computedLabelClass = computed(() => {
  const result: string[] = []
  if (props.buttons) {
    result.push(`btn btn-${props.buttonVariant} btn-${props.buttonSize}`)
  }
  return result
})
</script>
