<template>
    <div>
  <template v-for="opt in options" :key="opt.value">
    <div :class="computedWrapperClass">
        <input
            :class="computedInputClass"
            type="checkbox"
            :name="`check-input-${$.uid}`"
            :id="`check-input-${$.uid}-${opt.value}`"
            :disabled="disabled"
            :checked="model.includes(opt.value)"
            @click="() => handleCheck(opt.value)"
        />
        <label :class="computedLabelClass" :for="`check-input-${$.uid}-${opt.value}`">
            {{ opt.text }}
        </label>
    </div>
  </template>
</div>
</template>

<script setup lang="ts">
import type { Option } from '@/types/comp-fields'
import { computed } from 'vue'
interface IProps {
  modelValue: []
  options: Option[]
  readonly?: boolean
  disabled?: boolean
  inline?: boolean
  switches?: boolean
  isValid?: boolean
  isInvalid?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  placeholder: '',
  readonly: false,
  disabled: false,
  inline: false,
  switches: false,
  isValid: false,
  isInvalid: false
})
const emit = defineEmits(['update:modelValue', 'change', 'validate'])

const model = computed<string[]>({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const handleCheck = (key: string) => {
    const idx = model.value.findIndex(k => k === key)
    if (idx > -1) {
        model.value.splice(idx, 1)
    } else {
        model.value.push(key)
    }
}


const computedWrapperClass = computed(() => {
  const result: string[] = ['form-check']
  if (props.switches) {
    result.push('form-switch')
  }
  if(props.inline) {
    result.push('form-check-inline')
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
