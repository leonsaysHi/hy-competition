<template>
  <div :class="computedWrapperClass">
    <input
      :class="computedInputClass"
      type="checkbox"
      :name="`check-input-${$.uid}`"
      :id="`check-input-${$.uid}`"
      :disabled="disabled"
      :checked="model === value"
      :required="required"
      @click="() => (model = model === props.value ? props.uncheckValue : props.value)"
    />
    <label :class="computedLabelClass" :for="`check-input-${$.uid}`">
      <slot></slot>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { Size } from '@/types/comp-fields';
import { computed } from 'vue'
interface IProps {
  modelValue: boolean | string | number
  value?: boolean | string | number
  uncheckValue?: boolean | string | number
  placeholder?: string
  readonly?: boolean
  required?: boolean
  disabled?: boolean
  inline?: boolean
  switch?: boolean
  button?: boolean
  buttonSize?: Size
  isValid?: boolean
  isInvalid?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  value: true,
  uncheckValue: false,
  placeholder: '',
  readonly: false,
  required: false,
  disabled: false,
  inline: false,
  switch: false,
  button: false,
  buttonSize: 'md',
  isValid: false,
  isInvalid: false
})

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const computedWrapperClass = computed(() => {
  const result = []
  if (props.button) {
    result.push('d-inline-block')
  } else {
    result.push('form-check')
  }
  if (props.inline) {
    result.push('form-check-inline')
  }
  if (props.switch) {
    result.push('form-switch')
  }
  return result
})
const computedInputClass = computed(() => {
  const result: string[] = []
  if (props.button) {
    result.push('btn-check')
  } else {
    result.push('form-check-input')
  }
  return result
})
const computedLabelClass = computed(() => {
  const result: string[] = ['form-check-label']
  if (props.button) {
    result.push('btn')
    result.push(model.value === props.value ? 'btn-primary' : 'btn-outline-secondary')
    result.push('btn-' + props.buttonSize)
  } else {
    result.push('form-check-label')
  }
  return result
})
</script>
