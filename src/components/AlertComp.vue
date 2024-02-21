<template>
  <div class="alert fade" :class="computedClass" role="alert">
    <slot />
    <template v-if="props.dismissible">
      <button type="button" class="btn-close" @click="handleClose" aria-label="Close"></button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface IProps {
  modelValue?: boolean
  variant?: string
  dismissible?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  modelValue: true,
  variant: 'light',
  dismissible: false
})

const emit = defineEmits(['update:modelValue'])

const computedClass = computed(() => {
  const list = [`alert-${props.variant}`]
  if (props.modelValue) {
    list.push('show')
  } else {
    list.push('visually-hidden')
  }
  if (props.dismissible) {
    list.push('alert-dismissible')
  }
  return list
})

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>
