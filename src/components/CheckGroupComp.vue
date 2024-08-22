<template>
  <div :class="computedWrapperClass">
    <template v-for="opt in options" :key="opt.value">
      <CheckComp
        v-model="model[opt.value]"
        :switch="switches"
        :button="buttons"
        :button-size="size"
        :readonly="readonly"
        :disabled="disabled"
        :inline="inline"
        @click="handleCheck"
        >{{ opt.text }}</CheckComp
      >
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Option, Size } from '@/types/comp-fields'
import { computed } from 'vue'
import CheckComp from '@/components/CheckComp.vue'
interface IProps {
  modelValue: []
  options: Option[]
  readonly?: boolean
  disabled?: boolean
  inline?: boolean
  switches?: boolean
  buttons?: boolean
  size?: Size
  isValid?: boolean
  isInvalid?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  placeholder: '',
  readonly: false,
  disabled: false,
  inline: false,
  switches: false,
  buttons: false,
  size: 'md',
  isValid: false,
  isInvalid: false
})
const emit = defineEmits(['update:modelValue', 'change', 'validate'])

const model = computed<{ [key: string]: boolean }>({
  get: () =>
    Array.isArray(props.options)
      ? props.options.reduce((result, opt: Option) => {
          return {
            ...result,
            [opt.value]: Array.isArray(props.modelValue) && props.modelValue.includes(opt.value)
          }
        }, {})
      : {},
  set: (val) => {
    const newValue = Object.keys(val).filter((key) => val[key])
    emit('update:modelValue', newValue)
  }
})

const handleCheck = () => {
  const newModel = {
    ...model.value
  }
  model.value = newModel
}

const computedWrapperClass = computed(() => {
  const result = []
  if (props.buttons) {
    result.push('d-flex gap-2')
  }
  return result
})
</script>
