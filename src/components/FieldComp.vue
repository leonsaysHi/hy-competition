<template>
  <div class="mb-3">
    <template v-if="props.label">
      <label class="form-label">{{ label }}</label>
    </template>
    <slot></slot>
    <template v-if="props.helper">
      <div class="lh-1 small text-body-secondary">{{ helper }}</div>
    </template>
    <div class="invalid-feedback">
      {{ invalidFeedback }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  label?: string | undefined
  helper?: string | undefined
  invalidFeedback?: string | undefined
}
const props = withDefaults(defineProps<IProps>(), {
  label: undefined,
  helper: undefined,
  invalidFeedback: undefined
})
</script>
