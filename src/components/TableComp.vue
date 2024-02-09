<template>
  <table class="table" :class="{ 'table-sm': small }">
    <thead>
      <tr>
        <template v-for="({ label, sortable, key }, hIdx) in fields" :key="hIdx">
          <th
            scope="col"
            role="columnheader"
            :aria-colindex="hIdx + 1"
            :aria-sort="
              sortable
                ? sortKey !== key
                  ? 'none'
                  : sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                : undefined
            "
          >
            <div
              :class="{ 'cursor-pointer': sortable }"
              :tabindex="sortable ? 0 : -1"
              @keyup.enter="() => sortable && emit('sortByKey', key)"
              @click="() => sortable && emit('sortByKey', key)"
            >
              {{ typeof label === 'string' ? label : key }}
            </div>
          </th>
        </template>
      </tr>
    </thead>
    <tbody>
      <template v-for="(item, rIdx) in items" :key="rIdx">
        <tr>
          <template v-for="({ key }, hIdx) in fields" :key="hIdx">
            <td>
              <div>
                <slot :name="key" v-bind="{ items, item }">
                  {{ item[key] }}
                </slot>
              </div>
            </td>
          </template>
        </tr>
      </template>
    </tbody>
  </table>
  <div v-if="showEmpty && !items?.length">
    <slot name="empty">
      <p class="text-center text-danger mt-3">No result.</p>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { TableField, TableItem } from '@/types/comp-table'

const emit = defineEmits(['sortByKey'])

interface IProps {
  fields: TableField[]
  items: TableItem[]
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  small?: boolean
  isBusy?: boolean
  showEmpty?: boolean
}
withDefaults(defineProps<IProps>(), {
  sortKey: '',
  sortDirection: 'asc',
  thClass: 'bg-alt',
  tdClass: '',
  isBusy: false,
  showEmpty: false
})
</script>

<style scoped lang="scss"></style>
