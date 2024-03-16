<template>
  <div class="vstack gap-1">
    <template v-for="opt in options" :key="opt.value">
      <ButtonComp variant="outline-primary" @click="() => handleSelect(opt.value)">
        <strong class="jersey-number">#{{ opt.row.number }}</strong>
        <small class="jersey-name">{{ opt.text }}</small>
      </ButtonComp>
    </template>
  </div>
</template>

<script setup lang="ts">
import ButtonComp from '@/components/ButtonComp.vue'
import type { PlayerId } from '@/types/players'
import type { PlayersOptions } from '../PlaysInput.vue'
interface IProps {
  options: PlayersOptions[]
}

withDefaults(defineProps<IProps>(), {})
const emit = defineEmits(['select', 'cancel'])

const handleSelect = (playerId: PlayerId) => {
  emit('select', playerId)
}
const handleCancel = () => {
  emit('cancel')
}
</script>
