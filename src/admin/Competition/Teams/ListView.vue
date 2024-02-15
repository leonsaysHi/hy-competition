<script lang="ts" setup>
import { ref, inject, computed } from 'vue'
import type { TableField, TableItem } from '@/types/comp-table'
import ButtonComp from '@/components/ButtonComp.vue'
import TableComp from '@/components/TableComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import { TeamsLibKey, CompetitionKey } from '@/types/symbols'
import type { CompetitionTeam, Team, TeamId } from '@/types/teams'
import type { Option } from '@/types/comp-fields'
import useCompetitions from '@/composable/useCompetitions'

const { addRowTeam: addCompetitionTeamDoc, deleteRowTeam: deleteCompetitionTeamDoc } =
  useCompetitions()

const item = inject(CompetitionKey)
const teamsLib = inject(TeamsLibKey)

const fields: TableField[] = [
  { key: 'id', label: 'Teams' },
  { key: 'players', label: 'Players' },
  { key: 'actions', label: '' }
]
const getTeam = (teamId: TeamId): Team | undefined => {
  return teamsLib?.value?.find((team) => teamId === team.id)
}

const addTeamsOptions = computed((): Option[] => {
  const competitionTeams: TeamId[] = item?.value?.teams
    ? item?.value?.teams.map((team: CompetitionTeam) => team.id)
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
const getDefaultTeam = (): CompetitionTeam => ({
  id: '',
  sponsor: '',
  players: []
})
const addTeam = ref<CompetitionTeam>(getDefaultTeam())
const handleAddTeam = async (ev: Event) => {
  ev.preventDefault()
  await addCompetitionTeamDoc(item?.value.id, { ...addTeam.value })
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
  await deleteCompetitionTeamDoc(item?.value.id, deleteTeam.value)
  deletePlayerIsBusy.value = false
  deleteModal.value?.hide()
}
</script>
<template>
  <div>
    <p>All Teams list:</p>
    <TableComp :fields="fields" :items="item.teams">
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
  </div>
</template>
