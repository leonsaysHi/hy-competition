<script lang="ts" setup>
import type { TableField, TableItem } from '@/types/comp-table'
import type { Player } from '@/types/players'
import TableComp from '@/components/TableComp.vue'
import { computed, ref } from 'vue'

import usePlayersLib from '@/composable/usePlayersLib'
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import PlayerForm from './PlayerForm.vue'
import useLibs from '@/composable/useLibs'
import useOptionsLib from '@/composable/useOptionsLib'
import InputComp from '@/components/InputComp.vue'
import { stringIncludes } from '@/utils/strings'

const { isReady, playersRows: rows } = useLibs()
const { deleteRows: deletePlayers } = usePlayersLib()
const { getGender } = useOptionsLib()

const fields: TableField[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true
  },
  {
    key: 'identification',
    label: 'Identification'
  },
  {
    key: 'dob',
    label: 'Dob'
  },
  { key: 'gender', label: 'Gender' },
  {
    key: 'actions',
    label: ''
  }
]
const searchStr = ref<string>('')
const items = computed(() => {
  const items = Array.isArray(rows.value) ? rows.value.slice() : []
  return items
    .map(
      (row: Player): TableItem => ({
        ...row,
        name: [row.fname, row.lname].join(' ')
      })
    )
    .filter(
      (row: TableItem) => !searchStr.value || stringIncludes(row.name as string, searchStr.value)
    )
})
// Create / Edit
const editPlayer = ref<undefined | Player | null>(null)
const editModal = ref<typeof ModalComp>()
const handleCreate = () => {
  editPlayer.value = undefined
  editModal.value?.show()
}
const handleEdit = (row: TableItem) => {
  editPlayer.value = row as unknown as Player
  editModal.value?.show()
}
const handleEditDone = () => {
  editPlayer.value = null
  editModal.value?.hide()
}

// Delete
const deleteTeam = ref<Player | null>(null)
const deleteModal = ref<typeof ModalComp>()
const handleConfirmDelete = (row: TableItem) => {
  deleteTeam.value = row as unknown as Player
  deleteModal.value?.show()
}
const handleDelete = () => {
  deletePlayers([deleteTeam.value as Player])
  deleteTeam.value = null
  deleteModal.value?.hide()
}
</script>
<template>
  <div>
    <h1>All players</h1>
    <template v-if="!isReady || !rows">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="mb-3 d-flex align-items-bottom justify-content-between">
        <div>
          <InputComp v-model="searchStr" placeholder="Search..." />
        </div>
        <ButtonComp variant="primary" @click="handleCreate">Create</ButtonComp>
      </div>
      <TableComp :fields="fields" :items="items">
        <template #name="{ item }"> {{ item.fname }} {{ item.lname }} </template>
        <template #dob="{ value }"> {{ value || '-' }} </template>
        <template #gender="{ value }"> {{ getGender(value)?.long || '-' }} </template>
        <template #actions="{ item }">
          <div class="d-flex justify-content-end gap-1">
            <ButtonComp variant="light" size="sm" @click="() => handleEdit(item)">Edit</ButtonComp>
            <ButtonComp variant="danger" size="sm" @click="() => handleConfirmDelete(item)"
              >Delete</ButtonComp
            >
          </div>
        </template>
      </TableComp>
      <ModalComp ref="editModal" title="Edit player" hide-footer>
        <PlayerForm :row="editPlayer" @done="handleEditDone" />
      </ModalComp>
      <ModalComp ref="deleteModal" title="Delete player" ok-variant="danger" @ok="handleDelete">
        Sure?
      </ModalComp>
    </template>
  </div>
</template>
