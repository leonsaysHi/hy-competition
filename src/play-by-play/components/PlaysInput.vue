<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
import { computed, ref } from 'vue'
import type { LineUps, PlayByPlay } from '../Game.vue';

interface IProps {
    modelValue: PlayByPlay
    sec: number
    lineups: LineUps
    disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: (): PlayByPlay => props.modelValue,
  set: (val: PlayByPlay) => emit('update:modelValue', val)
})

</script>
<template>
  <div class="hstack">
    Stats input
    {{ model }}
  </div>
</template>