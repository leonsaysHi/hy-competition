<template>
  <div class="mb-3">
    <template v-if="props.label">
      <label class="form-label">{{ label }}<template v-if="required"><sup class="text-danger">*</sup></template></label>
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
  required?: boolean
  helper?: string | undefined
  invalidFeedback?: string | undefined
}
const props = withDefaults(defineProps<IProps>(), {
  label: undefined,
  required: false,
  helper: undefined,
  invalidFeedback: undefined
})
</script>
