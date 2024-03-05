<template>
  <nav aria-label="Page navigation example">
    <ul class="pagination">
      <template v-for="page in pageItems" :key="page">
        <li
          class="page-item"
          :class="{ active: pageItems.length && model === page, disabled: !pageItems.length }"
          :aria-current="model === page ? 'page' : false"
        >
          <template v-if="model === page"><span class="page-link">{{ page }}</span></template>
          <template v-else><a class="page-link" href="#" @click="model = page">{{ page }}</a></template>
        </li>
      </template>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { TableItem } from '@/types/comp-table'
import { computed } from 'vue'

interface IProps {
  modelValue: number
  perPage?: number
  items?: TableItem[]
}
const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
  perPage: 0
})
const totalPages = computed(() => {
  return props.perPage > 0 ? Math.ceil(props.items.length / props.perPage) : 1
})
const pageItems = computed<number[]>(() => {
  return new Array(totalPages.value).fill(0).map((_: number, idx: number) => Number(idx + 1))
})
const emit = defineEmits(['update:modelValue', 'input', 'validate', 'on-enter-key', 'change'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})
</script>
