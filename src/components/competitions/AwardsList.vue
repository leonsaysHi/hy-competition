<script lang="ts" setup>
import { computed } from 'vue'

import useLibs from '@/composable/useLibs'
import useOptionsLibs from '@/composable/useOptionsLib'
import type { AwardItem } from '@/types/stats'
import type { PlayerId } from '@/types/players'

interface IProps {
  items: AwardItem[]
  playerId?: PlayerId
}
const props = withDefaults(defineProps<IProps>(), {
  playerId: undefined
})

const { getPlayerName } = useLibs()
const { getAward } = useOptionsLibs()
const awards = computed(() => {
  return props.items.filter((row: AwardItem) => !props.playerId || row.id === props.playerId)
})
</script>
<template>
  <div>
    <template v-for="(award, idx) in awards" :key="idx">
      <h6 class="mb-0 d-inline-flex gap-2 p-1 border rounded-2">
        <span class="badge bg-warning">{{ getAward(award.value)?.text }}</span>
        <span>{{ getPlayerName(award.id) }}</span>
        <slot name="action" v-bind="{ idx }"></slot>
      </h6>
    </template>
  </div>
</template>
