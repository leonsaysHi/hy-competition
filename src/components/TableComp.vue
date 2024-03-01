<template>
  <table class="table" :class="{ 'table-sm': small, 'table-xs': xSmall }">
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
            :class="[sortedKey === key && 'text-bg-sorted-th']"
          >
            <div
              :class="[thClass, sortable && 'position-relative pt-3 cursor-pointer']"
              :tabindex="sortable ? 0 : -1"
              @keyup.enter="() => sortable && handleSort(key)"
              @click="() => sortable && handleSort(key)"
            >
              <span>{{ typeof label === 'string' ? label : key }}</span>
              <template v-if="sortable && sortedKey === key">
                <i
                  class="bi position-absolute top-0 start-50 translate-middle-x small lh-1"
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
            <td :class="[tdClass, sortedKey === key && 'text-bg-sorted-td']">
              <slot :name="key" v-bind="{ key, items, item, index }" :value="item[key]">
                {{ item[key] }}
              </slot>
            </td>
          </template>
        </tr>
      </template>
    </tbody>
    <template v-if="footer">
      <tfoot>
        <tr class="table-secondary">
          <template v-for="({ key, tfClass }, fIdx) in fields" :key="fIdx">
            <td :class="[tfClass, sortedKey === key && 'text-bg-sorted-td']">
              <slot :name="'footer'+key" v-bind="{ key, footer }" :value="footer[key]">
                {{ footer[key] }}
              </slot>
            </td>
          </template>
        </tr>
      </tfoot>
    </template>
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
  footer?: TableItem | undefined,
  sortedKey?: string
  sortedDirection?: 'asc' | 'desc'
  perPage?: number
  currentPage?: number
  small?: boolean
  xSmall?: boolean
  isBusy?: boolean
  showEmpty?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  footer: undefined,
  sortedKey: undefined,
  sortedDirection: 'asc',
  perPage: 0,
  currentPage: 1,
  small: false,
  xSmall: false,
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
    return compared * (sortedDirection.value === 'desc' ? -1 : 1)
  })

  const sliceFirstIdx = props.perPage > 0 ? (props.currentPage - 1) * props.perPage : 0
  const sliceLength = props.perPage > 0 ? Math.min(results.length, props.perPage) : results.length
  return results.slice(sliceFirstIdx, sliceFirstIdx + sliceLength)
})
const handleSort = (key: string) => {
  sortedDirection.value =
    key !== sortedKey.value || sortedDirection.value !== props.sortedDirection
      ? props.sortedDirection
      : props.sortedDirection === 'desc'
        ? 'asc'
        : 'desc'
  sortedKey.value = key
}
</script>

<style scoped lang="scss"></style>
