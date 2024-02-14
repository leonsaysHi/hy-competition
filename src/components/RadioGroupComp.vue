<template>
  <template v-for="(opt, idx) in options" :key="opt.value">
    <div class="form-check" :class="computedClass">
      <input
        class="form-check-input"
        type="radio"
        :name="`radio-input-${$.uid}`"
        :id="`radio-input-${$.uid}`"
        :disabled="disabled"
        :checked="model === opt.value"
        @change="model = opt.value"
      />
      <label class="form-check-label" :for="`radio-input-${$.uid}`">
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
  isValid?: boolean
  isInvalid?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  placeholder: '',
  options: () => [],
  readonly: false,
  required: false,
  disabled: false,
  isValid: false,
  isInvalid: false
})

const emit = defineEmits(['update:modelValue', 'change', 'validate'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const computedClass = computed(() => {
  const result: [] = []
  return result.join(' ')
})
</script>
