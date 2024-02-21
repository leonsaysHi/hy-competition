<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { TableField, TableItem } from '@/types/comp-table'
import ButtonComp from '@/components/ButtonComp.vue'
import TableComp from '@/components/TableComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import type { CompetitionTeam, CompetitionTeamDoc, Team, TeamId } from '@/types/teams'
import type { Option } from '@/types/comp-fields'

import useCompetition from '@/composable/useCompetition'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const { competitionId } = route.params
const { isReady: isLibsReady, teamsRows: teamsLib, getTeam } = useLibs()

const {
  isReady: isRowReady,
  row,
  writeTeamDoc: addCompetitionTeam,
  deleteTeam: deleteCompetitionTeam
} = useCompetition(competitionId)

const fields: TableField[] = [
  { key: 'id', label: 'Teams' },
  { key: 'players', label: 'Players' },
  { key: 'actions', label: '' }
]

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

// Add team
const getDefaultTeam = (): CompetitionTeamDoc => ({
  id: '',
  sponsor: '',
})
const addTeam = ref<CompetitionTeamDoc>(getDefaultTeam())
const handleAddTeam = async (ev: Event) => {
  ev.preventDefault()
  await addCompetitionTeam({ ...addTeam.value })
  addTeam.value = getDefaultTeam()
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
  deletePlayerIsBusy.value = false
  deleteModal.value?.hide()
}
</script>
<template>
  <div>
    <p>All Teams list:</p>
    <template v-if="!isLibsReady || !isRowReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <TableComp :fields="fields" :items="row?.teams">
        <template #id="{ item }">
          {{ getTeam(item.id).title }}
        </template>
        <template #players="{ item }">
          {{ item.players.length }}
        </template>
        <template #actions="{ item }">
          <div class="d-flex justify-content-end gap-1">
            <RouterLink
              class="btn btn-light btn-sm"
              :to="{ name: 'admin-competition-edit-team', params: { teamId: item.id } }"
              >Edit</RouterLink
            >
            <ButtonComp variant="danger" size="sm" @click="handleConfirmDeleteTeam(item)"
              >Remove</ButtonComp
            >
          </div>
        </template>
      </TableComp>
      <h5>Add team</h5>
      <form @submit="handleAddTeam" class="d-flex align-items-end gap-2">
        <FieldComp label="Team" class="flex-grow-1">
          <TypeaheadSelectComp v-model="addTeam.id" :options="addTeamsOptions" required />
        </FieldComp>
        <div class="mb-3">
          <ButtonComp variant="primary" type="submit">Add</ButtonComp>
        </div>
      </form>
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
