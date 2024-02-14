<template>
  <div class="d-flex justify-content-center">
    <div class="spinner-border" :class="computedClass" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface IProps {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'light' | 'danger' | 'warning' | 'success'
  size?: 'lg' | 'md' | 'sm'
}
const props = withDefaults(defineProps<IProps>(), {
  type: 'button',
  variant: 'secondary',
  size: 'md'
})

const computedClass = computed(() => {
  const result = []
  if (typeof props.variant === 'string' && props.variant.length) {
    result.push(`text-${props.variant}`)
  }
  if (props.size !== 'md') {
    result.push(`spinner-border-${props.size}`)
  }
  return result.join(' ')
})
</script>

<style scoped lang="scss"></style>
