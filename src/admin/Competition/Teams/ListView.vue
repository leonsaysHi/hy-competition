<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { TableField, TableItem } from '@/types/comp-table'
import ButtonComp from '@/components/ButtonComp.vue'
import TableComp from '@/components/TableComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import AlertComp from '@/components/AlertComp.vue'
import type { CompetitionTeam, Team, TeamId } from '@/types/teams'
import type { Option } from '@/types/comp-fields'

import useCompetition from '@/composable/useCompetition'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { useRoute } from 'vue-router'
import AddTeamForm from '../forms/AddTeamForm.vue'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'
const route = useRoute()
const { competitionId } = route.params
const { isReady: isLibsReady, teamsRows: teamsLib, getTeam } = useLibs()
const { isReady: isRowReady, row } = useCompetition(competitionId)
const { writeTeamDoc: addCompetitionTeam, deleteTeam: deleteCompetitionTeam } =
  useCompetitionAdmin(competitionId)

const fields: TableField[] = [
  { key: 'id', label: 'Teams' },
  { key: 'players', label: 'Players' },
  { key: 'actions', label: '' }
]

// Add team
const addTeamsOptions = computed((): Option[] => {
  const competitionTeams: TeamId[] = row?.value?.teams
    ? row?.value?.teams.map((team: CompetitionTeam) => team.id)
    : []
  return teamsLib?.value
    ? teamsLib?.value.map(
        (row: Team): Option => ({
          text: row.title,
          value: row.id,
          disabled: competitionTeams?.includes(row.id)
        })
      )
    : []
})
const addTeamDisabled = computed(
  () => Array.isArray(row?.value?.phases) && row.value.phases.length > 0
)
const addTeamIsBusy = ref(false)
const handleAddTeam = async (payload) => {
  addTeamIsBusy.value = true
  await addCompetitionTeam(payload)
  setTimeout(() => (addTeamIsBusy.value = false), 150)
}

// Delete team
const deleteTeam = ref<undefined | CompetitionTeam>()
const deletePlayerIsBusy = ref(false)
const deleteModal = ref<typeof ModalComp>()
const handleConfirmDeleteTeam = (row: TableItem) => {
  deleteTeam.value = row as unknown as CompetitionTeam
  deleteModal.value?.show()
}
const handleRemove = async () => {
  deletePlayerIsBusy.value = true
  await deleteCompetitionTeam(deleteTeam.value)
  setTimeout(() => {
    deletePlayerIsBusy.value = false
    deleteModal.value?.hide()
  }, 150)
}
</script>
<template>
  <div>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active" aria-current="page">Teams list</li>
      </ol>
    </nav>
    <template v-if="!isLibsReady || !isRowReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <template v-if="addTeamDisabled">
        <AlertComp variant="warning"
          >Competition as started, you can't add/remove teams anymore.</AlertComp
        >
      </template>
      <TableComp :fields="fields" :items="row?.teams">
        <template #id="{ item }">
          {{ getTeam(item.id).title }}
        </template>
        <template #players="{ item }">
          {{ Array.isArray(item.players) ? item.players.length : '0' }}
        </template>
        <template #actions="{ item }">
          <div class="d-flex justify-content-end gap-1">
            <RouterLink
              class="btn btn-light btn-sm"
              :to="{ name: 'admin-competition-edit-team', params: { teamId: item.id } }"
              >Edit</RouterLink
            >
            <ButtonComp
              variant="danger"
              size="sm"
              :disabled="addTeamDisabled"
              @click="handleConfirmDeleteTeam(item)"
              >Remove</ButtonComp
            >
          </div>
        </template>
      </TableComp>
      <h5>Add team</h5>
      <AddTeamForm
        :is-busy="addTeamIsBusy"
        :disabled="addTeamDisabled"
        :teams-options="addTeamsOptions"
        @submit="handleAddTeam"
      />
      <ModalComp ref="deleteModal" title="Confirm removal" ok-title="Remove" ok-variant="danger">
        <p>
          Sure to remove team
          <strong>{{ getTeam(deleteTeam?.id)?.title }}</strong> from team.
        </p>
        <template #modal-ok="{ okTitle, okVariant, okDisabled }">
          <ButtonComp
            :variant="okVariant"
            :disabled="okDisabled"
            :isBusy="deletePlayerIsBusy"
            @click="handleRemove"
          >
            {{ okTitle }}
          </ButtonComp>
        </template>
      </ModalComp>
    </template>
  </div>
</template>
