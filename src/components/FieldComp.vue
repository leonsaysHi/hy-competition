<template>
  <div class="mb-3">
    <template v-if="props.label">
      <label class="form-label">{{ label }}</label>
    </template>
    <slot></slot>
    <div class="invalid-feedback">
      {{ invalidFeedback }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  label?: string | undefined
  invalidFeedback?: string | undefined
}
const props = withDefaults(defineProps<IProps>(), {
  label: undefined,
  invalidFeedback: undefined
})
</script>
