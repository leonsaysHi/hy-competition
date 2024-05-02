<script lang="ts" setup>
import useBracketsLib, { type BracketItem } from '@/cityhoops/composable/useBracketsLib'
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import useCompetition from '@/composable/useCompetition'
import type { TableItem } from '@/types/comp-table'
import { computed, ref } from 'vue'
import { formatDate } from '@/utils/dates'

const competitionId = 'YNZaQiwQDMPHCWsE1KrQ'
const { isReady: isCompetitionReady, row: competitionRow } = useCompetition(competitionId)
const { isReady, rows, deleteRows } = useBracketsLib()

const fields = [
  {
    key: 'id',
    label: ''
  },
  {
    key: 'title',
    label: 'Title',
    sortable: true
  },
  {
    key: 'dateCreated',
    label: 'Date',
    sortable: true
  },
  {
    key: 'points',
    label: 'Puntos',
    sortable: true
  },
  {
    key: 'actions',
    label: ''
  }
]

const items = computed(() => {
  return rows.value?.map((row: BracketItem) => ({
    ...row,
    points: 0,
    diff: 0
  }))
})

// Delete game
const deleteModal = ref<typeof ModalComp>()
const deleteRow = ref<TableItem | undefined>()
const handleConfirmDeleteRow = (row: TableItem) => {
  deleteRow.value = row
  deleteModal.value?.show()
}
const handleDelete = async () => {
  const row = deleteRow.value
  await deleteRows([row as any])
  deleteModal.value?.hide()
}
</script>
<template>
  <div>
    <template v-if="!isReady">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else>
      Brackets list.
      <TableComp :fields="fields" :items="items">
        <template #points="{ value, item }">
          <strong>{{ value }}</strong> ({{ item.diff }})
        </template>
        <template #dateCreated="{ value }">
          {{ formatDate(value).long }}
          {{ formatDate(value).time }}
        </template>
        <template #actions="{ item }">
          <div class="hstack gap-2">
            <RouterLink
              class="btn btn-light btn-sm"
              :to="{ name: 'bracket-view', params: { bracketId: item.id } }"
            >
              <i class="bi bi-eye"></i>
            </RouterLink>
            <ButtonComp variant="danger" size="sm" @click="handleConfirmDeleteRow(item)"
              >Delete</ButtonComp
            >
          </div>
        </template>
      </TableComp>
      <ModalComp ref="deleteModal" title="Confirm detetion" ok-title="Delete" ok-variant="danger">
        <p>
          Sure to delete bracket
          <strong>{{ deleteRow?.title }}</strong
          >?
        </p>
        <template #modal-ok="{ okTitle, okVariant }">
          <ButtonComp :variant="okVariant" @click="handleDelete">
            {{ okTitle }}
          </ButtonComp>
        </template>
      </ModalComp>
    </template>
  </div>
</template>
