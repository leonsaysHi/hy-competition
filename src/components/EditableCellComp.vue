<template>
  <input
    v-model="model"
    :type="type"
    class="form-control"
    :class="{ [computedClass]: true, 'is-invalid': isInvalid, 'is-valid': isValid }"
    :placeholder="placeholder"
    :disabled="readonly || disabled"
    :required="required"
    @input="emit('input')"
    @keyup.enter="handleEnterKey"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface IProps {
  modelValue: string
  type?: 'text' | 'number' | 'email' | 'file' | 'date' | 'datetime-local' | 'color'
  placeholder?: string
  readonly?: boolean
  required?: boolean
  disabled?: boolean
  size?: 'lg' | 'md' | 'sm'
  isValid?: boolean
  isInvalid?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  type: 'text',
  placeholder: '',
  readonly: false,
  required: false,
  disabled: false,
  size: 'md',
  isValid: false,
  isInvalid: false
})
const emit = defineEmits(['update:modelValue', 'input', 'validate', 'enter-key', 'blur'])
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
const handleEnterKey = () => {
  emit('enter-key', model.value)
}
const handleBlur = () => {
  emit('blur', model.value)
}
</script>
