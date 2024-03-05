<script lang="ts" setup>
import { differenceInYears } from 'date-fns'
import InputComp from '@/components/InputComp.vue'
import PaginationComp from '@/components/PaginationComp.vue'
import TableComp from '@/components/TableComp.vue'
import usePlayersLib from '@/composable/usePlayersLib'
import type { TableField, TableItem } from '@/types/comp-table'
import type { Player } from '@/types/players'
import { computed, ref } from 'vue'
import { stringIncludes } from '@/utils/strings'
import { useI18n } from "vue-i18n"
const { t } = useI18n()
const { rows: playersLib } = usePlayersLib()

const currentPage = ref(1)
const perPage = 25
const searchStr = ref<string>('')
const fields: TableField[] = [
  {
    key: 'fname',
    label: t('global.playerDetails.firstName'),
    sortable: true
  },
  {
    key: 'lname',
    label: t('global.playerDetails.lastName'),
    sortable: true
  },
  { key: 'dob', label: t('global.playerDetails.age'), sortable: true }
]
const items = computed<TableItem[]>(() => {
  return Array.isArray(playersLib.value)
    ? playersLib.value
        ?.map(
          (row: Player): TableItem => ({
            id: row.id,
            lname: row.lname,
            fname: row.fname,
            dob: row.dob
          })
        )
        .filter((row: TableItem) => {
          const string = [row.lname, row.fname].join('')
          return !searchStr.value || stringIncludes(string, searchStr.value)
        })
    : []
})
</script>
<template>
  <div>
    <h1>{{ t('global.player', 2)}}</h1>
    <div class="mb-2 d-flex justify-content-end">
      <InputComp v-model="searchStr" :placeholder="`${t('global.search')}...`" />
    </div>
    <TableComp :fields="fields" :items="items" :currentPage="currentPage" :per-page="perPage">
      <template #fname="{ value, item }">
        <RouterLink
          class="link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover" 
          :to="{ name: 'player', params: { playerId: item.id } }">{{ value }}</RouterLink>
      </template>
      <template #lname="{ value, item }">
        <RouterLink
          class="link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover" 
          :to="{ name: 'player', params: { playerId: item.id } }">{{ value }}</RouterLink>
      </template>
      <template #dob="{ value }">
        <template v-if="value"> {{ differenceInYears(new Date(), value) }}</template>
        <template v-else><span class="text-body-secondary">n/a</span></template>
      </template>
    </TableComp>
    <div class="d-flex justify-content-center">
      <PaginationComp v-model="currentPage" :per-page="perPage" :items="items" />
    </div>
  </div>
</template>
