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
      <template v-for="(item, trIdx) in computedItems" :key="trIdx">
        <tr>
          <template v-for="({ key, tdClass }, tdIdx) in fields" :key="tdIdx">
            <td :class="[tdClass, sortedKey === key && 'text-bg-sorted-td']">
              <slot :name="key" v-bind="{ key, item, index: trIdx }" :value="item[key]">
                <template v-if="item[key] !== undefined">
                  {{ item[key] }}
                </template>
                <template v-else>
                  <span class="text-body-secondary">-</span>
                </template>
              </slot>
            </td>
          </template>
        </tr>
      </template>
    </tbody>
    <template v-if="footer">
      <tfoot>
        <tr class="table-secondary">
          <template v-for="({ key, tfClass }, tdIdx) in fields" :key="tdIdx">
            <td :class="[tfClass, sortedKey === key && 'text-bg-sorted-td']">
              <slot :name="'footer' + key" v-bind="{ key, footer }" :value="footer[key]">
                {{ footer[key] }}
              </slot>
            </td>
          </template>
        </tr>
      </tfoot>
    </template>
  </table>
  <div v-if="showEmpty && !computedItems?.length">
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
  footer?: TableItem | undefined
  sortedKey?: string
  sortedDirection?: 'asc' | 'desc'
  perPage?: number
  currentPage?: number
  small?: boolean
  isBusy?: boolean
  showEmpty?: boolean
  ascOnly?: boolean
  descOnly?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  footer: undefined,
  sortedKey: undefined,
  sortedDirection: 'asc',
  perPage: 0,
  currentPage: 1,
  small: false,
  isBusy: false,
  showEmpty: false,
  ascOnly: false,
  descOnly: false
})
const sortedKey = ref<string | undefined>(props.sortedKey)
const sortedDirection = ref<'asc' | 'desc'>(
  props.ascOnly ? 'asc' : props.descOnly ? 'desc' : props.sortedDirection
)
const computedItems = computed(() => {
  if (!Array.isArray(props.items)) {
    console.warn('Items is not an array:', props.items)
    return []
  }
  const results = props.items.slice()
  const key = sortedKey.value
  if (typeof key === 'string') {
    const field = props.fields.find((field: TableField) => field.key === key)
    results.sort((a, b) => {
      const aVal = field?.sortByFormatted && field?.formatter ? field.formatter(a[key], a) : a[key]
      const bVal = field?.sortByFormatted && field?.formatter ? field.formatter(b[key], b) : b[key]
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
  }
  // pagination
  const sliceFirstIdx = (props.currentPage - 1) * props.perPage
  const sliceEnd =
    props.perPage > 0 ? Math.min(results.length, sliceFirstIdx + props.perPage) : results.length
  return results.slice(sliceFirstIdx, sliceEnd).map((row: TableItem) => {
    return Object.keys(row).reduce((item: TableItem, key: string, idx: number) => {
      const field = props.fields.find((field: TableField) => field.key === key)
      item[key] = field?.formatter ? field.formatter(row[key], row, idx) : row[key]
      return item
    }, {})
  })
})
const handleSort = (key: string) => {
  const { ascOnly, descOnly } = props
  sortedDirection.value = ascOnly
    ? 'asc'
    : descOnly
      ? 'desc'
      : key !== sortedKey.value
        ? props.sortedDirection
        : sortedDirection.value === 'desc'
          ? 'asc'
          : 'desc'
  sortedKey.value = key
}
</script>

<style scoped lang="scss"></style>
