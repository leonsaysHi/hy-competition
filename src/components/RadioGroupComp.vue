<template>
  <div :class="computedWrapperClass">
    <template v-for="opt in options" :key="opt.value">
      <RadioComp
        v-model="model"
        :value="opt.value"
        :disabled="opt.disabled || disabled"
        :buttons="buttons"
        :button-size="size"
        :button-variant="opt.value === model ? buttonVariantActive : buttonVariant"
        >{{ opt.text }}</RadioComp
      >
    </template>
  </div>
</template>

<script setup lang="ts">
import RadioComp from '@/components/RadioComp.vue'
import type { Option, Size, Variant } from '@/types/comp-fields'
import { computed } from 'vue'
interface IProps {
  modelValue: string | number | undefined | boolean
  options: Option[]
  placeholder?: string
  readonly?: boolean
  required?: boolean
  disabled?: boolean
  stacked?: boolean
  buttons?: boolean
  buttonVariant?: Variant
  buttonVariantActive?: Variant
  size?: Size
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
  buttonVariant: 'outline-secondary',
  buttonVariantActive: 'primary',
  size: 'md',
  isValid: false,
  isInvalid: false
})

const computedWrapperClass = computed(() => {
  const result = []
  if (props.buttons) {
    result.push('d-flex gap-1')
  } else if (props.stacked) {
    result.push('vstack gap-1')
  }
  return result
})

const emit = defineEmits(['update:modelValue', 'change', 'validate'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('change', val)
  }
})
</script>
