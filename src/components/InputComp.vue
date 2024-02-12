<template>
  <div class="mb-3">
    <template v-if="props.label">
      <label class="form-label">{{ label }}</label>
    </template>
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
    />
    <div class="invalid-feedback">
      {{ invalidFeedback }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface IProps {
  modelValue: string
  type?: 'text' | 'number' | 'email' | 'file' | 'date' | 'datetime-local' | 'color'
  label?: string | undefined
  placeholder?: string
  readonly?: boolean
  required?: boolean
  disabled?: boolean
  size?: 'lg' | 'md' | 'sm'
  isValid?: boolean
  isInvalid?: boolean
  invalidFeedback?: string | undefined
}
const props = withDefaults(defineProps<IProps>(), {
  type: 'text',
  label: undefined,
  placeholder: '',
  readonly: false,
  required: false,
  disabled: false,
  size: 'md',
  isValid: false,
  isInvalid: false,
  invalidFeedback: undefined
})
const emit = defineEmits(['update:modelValue', 'input', 'validate', 'on-enter-key'])
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
  emit('on-enter-key')
}
</script>
