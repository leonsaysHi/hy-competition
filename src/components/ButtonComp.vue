<template>
  <button :type="type" class="btn" :class="computedClass" :disabled="disabled">
    <slot> </slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface IProps {
  type?: 'button' | 'submit' | 'reset'
  variant?:
    | 'primary'
    | 'outline-primary'
    | 'secondary'
    | 'outline-secondary'
    | 'light'
    | 'danger'
    | 'warning'
    | 'success'
    | 'link'
  size?: 'lg' | 'md' | 'sm'
  pill?: boolean
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  type: 'button',
  variant: 'secondary',
  size: 'md',
  pill: false,
  disabled: false
})

const computedClass = computed(() => {
  const result = []
  if (typeof props.variant === 'string' && props.variant.length) {
    result.push(props.variant)
  }
  if (props.size !== 'md') {
    result.push(props.size)
  }
  return result.map((str) => `btn-${str}`).join(' ')
})
</script>

<style scoped lang="scss"></style>
