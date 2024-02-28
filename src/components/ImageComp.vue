<template>
  <img class="img-fluid" :src="props.src" :alt="props.title" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface IProps {
  src: string | undefined
  title?: string
  width?: number | 'auto'
  height?: number | 'auto'
  square?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  title: '',
  width: 'auto',
  height: 'auto',
  square: false
})

const width = computed(() => (typeof props.width === 'number' ? props.width + 'px' : props.width))
const height = computed(() =>
  (typeof props.width === 'number' && props.square) || typeof props.height === 'number'
    ? (props.square ? props.width : props.height) + 'px'
    : props.height
)
</script>
