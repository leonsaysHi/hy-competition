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
import { computed } from 'vue'
interface IProps {
  modelValue: boolean | string
  value?: boolean | string
  uncheckValue?: boolean | string
  placeholder?: string
  readonly?: boolean
  required?: boolean
  disabled?: boolean
  inline?: boolean
  switch?: boolean
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
  isValid: false,
  isInvalid: false
})

const emit = defineEmits(['update:modelValue', 'change', 'validate'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const computedWrapperClass = computed(() => {
  const result = ['form-check']
  if (props.inline) {
    result.push('form-check-inline')
  }
  if (props.switch) {
    result.push('form-switch')
  }
  return result
})
const computedInputClass = computed(() => {
  const result: string[] = ['form-check-input']
  return result
})
const computedLabelClass = computed(() => {
  const result: string[] = ['form-check-label']
  return result
})
</script>
