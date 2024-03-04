<template>
  <div class="d-inline-flex gap-1 small">
    <template v-for="(colorclass, idx) in items" :key="idx">
      <i class="bi bi-circle-fill" :class="colorclass"></i>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { GamesHist } from '@/types/stats'
import { computed } from 'vue'

interface IProps {
  items: GamesHist
  length?: number
}
const props = withDefaults(defineProps<IProps>(), {
  length: 3
})
const items = computed(() => {
  const items = new Array(props.length).fill(0)
  const start = items.length - props.items.length
  items.splice(start, props.items.length, ...props.items)
  return items
    .map((h) => (h > 0 ? 'win' : h < 0 ? 'loss' : 'body-tertiary opacity-25'))
    .map((str) => `text-${str}`)
})
</script>
