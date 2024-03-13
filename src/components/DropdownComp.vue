<template>
  <div 
    ref="dropdownEl"
    class="dropdown"
  >
    <ButtonComp class="dropdown-toggle" :class="computedToggleClass" :variant="variant" :size="size" data-bs-toggle="dropdown" aria-expanded="false">
        {{ selectedOption?.text || placeholder }}
    </ButtonComp>

    <ul class="dropdown-menu">
        <template v-for="opt in options" :key="opt.value">
            <li><ButtonComp class="dropdown-item" :class="computedMenuClass" @click="handleSelect(opt.value)">{{ opt.text }}</ButtonComp></li>
        </template>
    </ul>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ButtonComp from './ButtonComp.vue';
import type { Variant, Option, Size } from '@/types/comp-fields';
interface IProps {
  modelValue: string | undefined
  options: Option[]
  placeholder?: string
  disabled?: boolean
  variant?: Variant
  size?: Size
}
const props = withDefaults(defineProps<IProps>(), {
  placeholder: 'Select',
  disabled: false,
  variant: 'primary',
  size: 'sm'
})

const emit = defineEmits(['update:modelValue', 'change'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})
const handleSelect = (val) => {
  console.log('val', val)
  model.value = val
}
const selectedOption = computed(() => props.options.find((opt: Option) => opt.value === model.value))
const computedToggleClass = computed(() => {
  const result: string[] = []
  props.variant === 'link' &&  result.push(`text-reset`)
  props.size === 'lg' &&  result.push(`fs-4 fw-bold`)
  return result
})
const computedMenuClass = computed(() => {
  const result: string[] = []
  props.size === 'lg' &&  result.push(`fs-5 fw-bold`)
  return result
})
</script>
