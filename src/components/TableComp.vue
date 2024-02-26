<template>
  <table class="table" :class="{ 'table-sm': small }">
    <thead class="table-light">
      <tr>
        <template v-for="({ label, sortable, thClass, key }, hIdx) in fields" :key="hIdx">
          <th
            scope="col"
            role="columnheader"
            :aria-colindex="hIdx + 1"
            :aria-sort="
              sortable
                ? sortedKey !== key
                  ? 'none'
                  : sortedDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                : undefined
            "
            :class="[thClass, sortedKey === key && 'text-bg-dark']"
          >
            <div
              class="d-flex gap-2 align-items-end justify-content-between"
              :class="sortable && 'cursor-pointer'"
              :tabindex="sortable ? 0 : -1"
              @keyup.enter="() => sortable && handleSort(key)"
              @click="() => sortable && handleSort(key)"
            >
              <span>{{ typeof label === 'string' ? label : key }}</span>
              <template v-if="sortable && sortedKey === key">
                <i
                  class="bi"
                  :class="`bi-caret-${sortedDirection === 'asc' ? 'up' : 'down'}-fill`"
                ></i>
              </template>
            </div>
          </th>
        </template>
      </tr>
    </thead>
    <tbody>
      <template v-for="(item, index) in sortedItems" :key="index">
        <tr>
          <template v-for="({ key, tdClass }, hIdx) in fields" :key="hIdx">
            <td :class="[tdClass, sortedKey === key && 'text-bg-dark']">
              <slot :name="key" v-bind="{ key, items, item, index }" :value="item[key]">
                {{ item[key] }}
              </slot>
            </td>
          </template>
        </tr>
      </template>
    </tbody>
  </table>
  <div v-if="showEmpty && !items?.length">
    <slot name="empty">
      <p class="text-center text-secondary mt-2">No result.</p>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { TableField, TableItem } from '@/types/comp-table'
import { compareDesc, isDate } from 'date-fns'
import { computed, ref } from 'vue'

interface IProps {
  fields: TableField[]
  items: TableItem[]
  sortedKey?: string
  sortedDirection?: 'asc' | 'desc'
  small?: boolean
  isBusy?: boolean
  showEmpty?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  sortedKey: undefined,
  sortedDirection: 'asc',
  thClass: 'bg-alt',
  tdClass: '',
  isBusy: false,
  showEmpty: true
})
const sortedKey = ref<string | undefined>(props.sortedKey)
const sortedDirection = ref<'asc' | 'desc'>(props.sortedDirection)
const sortedItems = computed(() => {
  const results = props.items.slice()
  if (typeof sortedKey.value !== 'string') {
    return results
  }
  results.sort((a, b) => {
    const aVal = a[sortedKey.value as string]
    const bVal = b[sortedKey.value as string]
    const compared =
      typeof aVal === 'string' && typeof bVal === 'string'
        ? aVal.localeCompare(bVal)
        : isDate(aVal) && isDate(bVal)
          ? compareDesc(aVal, bVal)
          : typeof aVal === 'number' && typeof bVal === 'number'
            ? aVal - bVal
            : 0
    return compared * (sortedDirection.value === 'asc' ? -1 : 1)
  })
  return results
})
const handleSort = (key: string) => {
  sortedDirection.value =
    key !== sortedKey.value || sortedDirection.value === 'desc' ? 'asc' : 'desc'
  sortedKey.value = key
}
</script>

<style scoped lang="scss"></style>
