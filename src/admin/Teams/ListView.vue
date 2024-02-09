<script lang="ts" setup>
import type { TableField, TableItem } from '@/types/comp-table'
import type { Team, TeamId } from '@/types/teams'
import TableComp from '@/components/TableComp.vue'
import { ref, inject } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import TeamForm from './Form.vue'
import useTeams from '@/composable/useTeams'

const teams = inject('teams') as TableItem[]
const fields: TableField[] = [
  {
    key: 'title',
    label: 'Team'
  },
  {
    key: 'actions',
    label: ''
  }
]
// Create / Edit
const editTeam = ref<undefined | Team | null>(null)
const editModal = ref<typeof ModalComp>()
  const handleCreate = () => {
  editTeam.value = undefined
  editModal.value?.show()
}
const handleEdit = (row: TableItem) => {
  console.log('edit?', row.id)
  editTeam.value = row as unknown as Team
  editModal.value?.show()
}
const handleEditDone = () => {
  editTeam.value = null
  editModal.value?.hide()
}

// Delete
const { deleteRows: deleteTeams } = useTeams()
const deleteTeam = ref<Team | null>(null)
const deleteModal = ref<typeof ModalComp>()
const handleConfirmDelete = (row: TableItem) => {
  console.log('delete?', row.id)
  deleteTeam.value = row as unknown as Team
  deleteModal.value?.show()
}
const handleDelete = () => {
  deleteTeams([deleteTeam.value as Team])
  deleteTeam.value = null
  deleteModal.value?.hide()
}

</script>
<template>
  <div>
    <h1>Teams admin</h1>
    <div class="d-flex align-items-bottom justify-content-between">
      <p>All teams list:</p>
      <ButtonComp variant="primary" @click="handleCreate">Create</ButtonComp>
    </div>
    <TableComp :fields="fields" :items="teams">
      <template #actions="{ item }">
        <div class="d-flex justify-content-end gap-1">
          <ButtonComp variant="light" size="sm" @click="() => handleEdit(item)">Edit</ButtonComp>
          <ButtonComp variant="danger" size="sm" @click="() => handleConfirmDelete(item)">Delete</ButtonComp>
        </div> </template
      >
    </TableComp>
    <ModalComp ref="editModal" title="Edit team" hide-footer>
      <TeamForm :row="editTeam" @done="handleEditDone" />
    </ModalComp>
    <ModalComp 
    ref="deleteModal" 
    title="Delete team"
    ok-variant="danger" 
    @ok="handleDelete">
      Sure?
    </ModalComp>
  </div>
</template>
