<script lang="ts" setup>
import InputComp from '@/components/InputComp.vue'
import PaginationComp from '@/components/PaginationComp.vue'
import TableComp from '@/components/TableComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useTeamsLib from '@/composable/useTeamsLib'
import type { TableField, TableItem } from '@/types/comp-table'
import type { Team } from '@/types/teams'
import { stringIncludes } from '@/utils/strings'
import { computed, ref } from 'vue'
const { rows: teamsLib } = useTeamsLib()

const currentPage = ref(1)
const perPage = 25
const searchStr = ref<string>('')
const fields: TableField[] = [
  { key: 'id', label: '' },
  { key: 'title', label: 'Teams', sortable: true }
]
const items = computed<TableItem[]>(() => {
  return Array.isArray(teamsLib.value)
    ? teamsLib.value?.map(
        (row: Team): TableItem => ({
          id: row.id,
          title: row.title
        })
      ).filter(
        (row: TableItem) => {
          return !searchStr.value || stringIncludes(row.title as string, searchStr.value)
        }
      )
    : []
})
</script>
<template>
  <div>
    <h1>Teams</h1>
    <div class="mb-2 d-flex justify-content-end">
      <InputComp v-model="searchStr" placeholder="Search..." />
    </div>
    <TableComp :fields="fields" :items="items" :per-page="perPage" :current-page="currentPage">
      <template #id="{ value }">
        <TeamLogo :team-id="value" :size="23" />
      </template>
    </TableComp>
    <div class="d-flex justify-content-center">
      <PaginationComp v-model="currentPage" :per-page="perPage" :items="items" />
    </div>
  </div>
</template>
