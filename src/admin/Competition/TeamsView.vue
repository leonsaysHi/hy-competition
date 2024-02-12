<script lang="ts" setup>
import { ref, inject } from 'vue'
import type CompetitionClass from '@/models/Competition'
import type { TableField, TableItem } from '@/types/comp-table'
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import TableComp from '@/components/TableComp.vue'
import TeamForm from './TeamForm.vue'
import { TeamsKey } from '@/types/symbols'
import type { CompetitionTeam, Team, TeamId } from '@/types/teams'


interface IProps {
  item?: CompetitionClass
}
const props = withDefaults(defineProps<IProps>(), {
  item: null
})

const teamsLib = inject(TeamsKey)

const fields: TableField[] = [
  { key: 'id', label: 'Teams' },
  { key: 'players', label: 'Players' },
  { key: 'actions', label: '' }
]
const getTeam = (teamId: TeamId):Team | undefined => {
  return teamsLib?.value?.find(team => teamId === team.id)
}

// Create / Edit Team
const editTeam = ref<undefined | CompetitionTeam | null>(null)
const editTeamModal = ref<typeof ModalComp>()
const handleCreateTeam = () => {
  editTeam.value = undefined
  editTeamModal.value?.show()
}
const handleEditTeam = (row: TableItem) => {
  editTeam.value = row as unknown as CompetitionTeam 
  editTeamModal.value?.show()
}
const handleEditTeamDone = () => {
  editTeam.value = null
  editTeamModal.value?.hide()
}

// Delete Team
const deleteTeam = ref<undefined | CompetitionTeam | null>(null)
const handleConfirmDeleteTeam = (row: TableItem) => {
  deleteTeam.value = row as unknown as CompetitionTeam
}

</script>
<template>
  <div>
    <h5>{{ item.row.title }}</h5>
    <p>{{ item.teams }}</p>
    <div class="d-flex align-items-bottom justify-content-between">
      <p>All Teams list:</p>
      <div class="d-flex justify-content-between gap-2">
        <ButtonComp variant="primary" @click="handleCreateTeam">Add Team</ButtonComp>
      </div>
    </div>
    <TableComp :fields="fields" :items="props.item.teams">
      <template #id="{ item }">
        {{ getTeam(item.id).title }}
      </template>
      <template #players="{ item }">
        {{ item.players.length }}
      </template>
      <template #actions="{ item }">
        <div class="d-flex justify-content-end gap-1">
          <ButtonComp variant="light" size="sm" @click="handleEditTeam(item)">Edit</ButtonComp>
          <ButtonComp variant="danger" size="sm" @click="handleConfirmDeleteTeam(item)"
            >Delete</ButtonComp
          >
        </div>
      </template>
    </TableComp>
    <ModalComp ref="editTeamModal" title="Edit team" hide-footer>
      <TeamForm :row="editTeam" :teams="item.teams" @done="handleEditTeamDone" />
    </ModalComp>
  </div>
</template>

