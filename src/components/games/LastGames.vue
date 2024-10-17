<template>
  <div class="last-games small">
    <template v-for="(colorclass, idx) in items" :key="idx">
      <i class="bi bi-circle-fill" :class="[colorclass, idx < 2 && 'd-none d-lg-block']"></i>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { GamesHist } from '@/types/player-stats'
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
  const start = Math.max(0, items.length - props.items.length)
  items.splice(start, props.items.length, ...props.items)
  return items
    .map((h) => (h > 0 ? 'win' : h < 0 ? 'loss' : 'body-tertiary opacity-25'))
    .map((str) => `text-${str}`)
})
</script>
