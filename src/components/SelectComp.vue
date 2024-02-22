<template>
  <select
    v-model="model"
    class="form-select"
    :class="{ [computedClass]: true, 'is-invalid': isInvalid, 'is-valid': isValid }"
    :placeholder="placeholder"
    :disabled="readonly || disabled"
    :required="required"
    @change="handleChange"
  >
    <template v-if="placeholder">
      <option value="">{{ placeholder }}</option>
    </template>
    <template v-for="opt in options" :key="opt.value">
      <option :value="opt.value">{{ opt.text }}</option>
    </template>
  </select>
</template>

<script setup lang="ts">
import type { Option } from '@/types/comp-fields'
import { computed } from 'vue'
interface IProps {
  modelValue: string | undefined
  options: Option[]
  placeholder?: string
  readonly?: boolean
  required?: boolean
  disabled?: boolean
  size?: 'lg' | 'md' | 'sm'
  isValid?: boolean
  isInvalid?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  placeholder: 'Select...',
  options: () => [],
  readonly: false,
  required: false,
  disabled: false,
  size: 'md',
  isValid: false,
  isInvalid: false
})
const emit = defineEmits(['update:modelValue', 'change', 'validate'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const computedClass = computed(() => {
  const result = []
  if (props.size !== 'md') {
    result.push(props.size)
  }
  return result.map((str) => `btn-${str}`).join(' ')
})
const handleChange = () => {
  emit('change', model.value)
}
</script>
