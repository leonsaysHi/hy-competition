<template>
  <div class="d-flex gap-1 small">
    <template v-for="(colorclass, idx) in items" :key="idx">
      <i class="bi bi-circle-fill" :class="colorclass"></i>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface IProps {
  value?: (1 | -1 | 0)[]
  length?: number
}
const props = withDefaults(defineProps<IProps>(), {
  value: () => [],
  length: 3
})
const items = computed(() => {
  const items = new Array(props.length).fill(0)
  const start = items.length - props.value.length
  items.splice(start, props.value.length, ...props.value)
  return items
    .map((h) => (h > 0 ? 'win' : h < 0 ? 'loss' : 'body-tertiary opacity-25'))
    .map((str) => `text-${str}`)
})
</script>
