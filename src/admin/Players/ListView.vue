<script lang="ts" setup>
import type { TableField, TableItem } from '@/types/comp-table'
import type { Player } from '@/types/players'
import TableComp from '@/components/TableComp.vue'
import { ref, inject } from 'vue'
import { PlayersLibKey } from '@/types/symbols'
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import PlayerForm from './Form.vue'
import usePlayers from '@/composable/usePlayers'

const players = inject(PlayersLibKey)
const fields: TableField[] = [
  {
    key: 'name',
    label: 'Name'
  },
  {
    key: 'identification',
    label: 'Identification'
  },
  {
    key: 'dob',
    label: 'Dob'
  },
  {
    key: 'actions',
    label: ''
  }
]
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
const { deleteRows: deletePlayers } = usePlayers()
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
    <h1>Players admin</h1>
    <div class="d-flex align-items-bottom justify-content-between">
      <p>All players list:</p>
      <ButtonComp variant="primary" @click="handleCreate">Create</ButtonComp>
    </div>
    <TableComp :fields="fields" :items="players">
      <template #name="{ item }"> {{ item.fname }} {{ item.lname }} </template>
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
  </div>
</template>
