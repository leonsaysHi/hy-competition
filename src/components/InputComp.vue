<template>
  <input
    v-model="model"
    :type="type"
    class="form-control"
    :class="{ [computedClass]: true, 'is-invalid': isInvalid, 'is-valid': isValid }"
    :placeholder="placeholder"
    :disabled="readonly || disabled"
    :required="required"
    :min="type === 'number' ? props.min : undefined"
    @input="emit('input')"
    @keyup.enter="handleEnterKey"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface IProps {
  modelValue: string | number
  type?: 'text' | 'number' | 'email' | 'file' | 'date' | 'datetime-local' | 'color' | 'hidden'
  placeholder?: string
  readonly?: boolean
  required?: boolean
  disabled?: boolean
  size?: 'lg' | 'md' | 'sm'
  min?: number
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
  min: 0,
  isValid: false,
  isInvalid: false
})
const emit = defineEmits(['update:modelValue', 'input', 'validate', 'on-enter-key', 'update'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('update', val)
  }
})
const computedClass = computed(() => {
  const result = []
  if (props.size !== 'md') {
    result.push(`form-control-${props.size}`)
  }
  return result.join(' ')
})
const handleEnterKey = () => {
  emit('on-enter-key')
}
</script>
