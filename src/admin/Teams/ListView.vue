<script lang="ts" setup>
import type { TableField, TableItem } from '@/types/comp-table'
import type { Team, TeamDoc } from '@/types/teams'
import TableComp from '@/components/TableComp.vue'
import { computed, ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import TeamForm from './TeamForm.vue'
import useLibs from '@/composable/useLibs'
import useTeamsLib from '@/composable/useTeamsLib'
import SpinnerComp from '@/components/SpinnerComp.vue'
import InputComp from '@/components/InputComp.vue'
import { stringIncludes } from '@/utils/strings'
import { uploadTeamLogo } from '@/firebase-storage'

const { isReady, teamsRows: rows } = useLibs()
const { writeRows : writeTeams, deleteRows } = useTeamsLib()
const fields: TableField[] = [
  {
    key: 'title',
    label: 'Team',
    sortable: true,
  },
  {
    key: 'actions',
    label: ''
  }
]
const searchStr = ref<string>('')
const items = computed(() => rows.value 
    ? rows.value.filter((row:Team) => 
      !searchStr.value || stringIncludes(row.title, searchStr.value)
    ) 
    : rows.value
)
// Create / Edit
const editTeam = ref<undefined | Team>()
const editModal = ref<typeof ModalComp>()
const handleCreate = () => {
  editTeam.value = undefined
  editModal.value?.show()
}
const handleEdit = (row: TableItem) => {
  editTeam.value = row as unknown as Team
  editModal.value?.show()
}
const handleSubmitEdit = async (payload: Team) => {
  const {
    logoUpload,
    ...teamDoc
  }: {
    logoUpload: File | undefined
    teamDoc: TeamDoc
  } = payload
  if (logoUpload) {
    teamDoc.logo = await uploadTeamLogo(logoUpload, new Date().getTime().toString())
  }
  await writeTeams([teamDoc])
  editTeam.value = undefined
  editModal.value?.hide()
}

// Delete
const deleteTeam = ref<Team | null>(null)
const deleteModal = ref<typeof ModalComp>()
const handleConfirmDelete = (row: TableItem) => {
  deleteTeam.value = row as unknown as Team
  deleteModal.value?.show()
}
const handleDelete = () => {
  deleteRows([deleteTeam.value as Team])
  deleteTeam.value = null
  deleteModal.value?.hide()
}
</script>
<template>
  <div>
    <h1>All teams</h1>
    <template v-if="!isReady || !rows">
      <SpinnerComp />
    </template>
    <template v-else>
      <p class="d-flex align-items-bottom justify-content-between">
        <div>
          <InputComp v-model="searchStr" placeholder="Search..." />
        </div>
        <ButtonComp variant="primary" @click="handleCreate">Create</ButtonComp>
      </p>
      <TableComp :fields="fields" :items="items">
        <template #actions="{ item }">
          <div class="d-flex justify-content-end gap-1">
            <ButtonComp variant="light" size="sm" @click="() => handleEdit(item)">Edit</ButtonComp>
            <ButtonComp variant="danger" size="sm" @click="() => handleConfirmDelete(item)"
              >Delete</ButtonComp
            >
          </div>
        </template>
      </TableComp>
      <ModalComp ref="editModal" title="Edit team" hide-footer>
        <TeamForm :row="editTeam" @submit="handleSubmitEdit" />
      </ModalComp>
      <ModalComp ref="deleteModal" title="Delete team" ok-variant="danger" @ok="handleDelete">
        Sure?
      </ModalComp>
    </template>
  </div>
</template>
@/composable/useTeamsLib
