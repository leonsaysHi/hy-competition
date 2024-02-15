<script lang="ts" setup>
import { useRoute, RouterLink } from 'vue-router'
import { ref, inject, computed } from 'vue'
import type { TableField, TableItem } from '@/types/comp-table'
import TableComp from '@/components/TableComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import { CompetitionKey, TeamsLibKey } from '@/types/symbols'
import type { Option } from '@/types/comp-fields'
import type { CompetitionTeam, Team, TeamId } from '@/types/teams'
import type { Game } from '@/types/games'
import useCompetitions from '@/composable/useCompetitions'
import InputComp from '@/components/InputComp.vue'

const { addRowGame: addCompetitionGameDoc, deleteRowGame: deleteCompetitionGameDoc } =
  useCompetitions()

const route = useRoute()
const { competitionId } = route.params

const item = inject(CompetitionKey)
const teamsLib = inject(TeamsLibKey)

const fields: TableField[] = [
  { key: 'teams', label: 'Games' },
  { key: 'datetime', label: 'Date' },
  { key: 'actions', label: '' }
]
const getTeam = (teamId: TeamId): Team => {
  return teamsLib.value.find((team) => teamId === team.id)
}
const gameTeamsOptions = computed((): Option[] => {
  return item?.value.teams?.map((row: CompetitionTeam): Option => {
    const team = getTeam(row.id)
    return {
      value: team.id,
      text: team.title,
      disable: addGame.value.teams?.includes(team.id)
    }
  })
})

// Add game
const getDefaultGame = (): Game => ({
  id: '',
  teams: [],
  datetime: '',
  scores: {},
  boxscore: {},
  awards: []
})
const addGame = ref<Game>(getDefaultGame())
const handleAddGame = async (ev: Event) => {
  ev.preventDefault()
  await addCompetitionGameDoc(competitionId, { ...addGame.value })
  addGame.value = getDefaultGame()
}

// Delete game
const deleteGame = ref<undefined | Game>()
const deleteGameIsBusy = ref(false)
const deleteModal = ref<typeof ModalComp>()
const handleConfirmDeleteGame = (row: TableItem) => {
  deleteGame.value = row as unknown as Game
  deleteModal.value?.show()
}
const handleDelete = async () => {
  deleteGameIsBusy.value = true
  await deleteCompetitionGameDoc(competitionId, { ...deleteGame.value })
  deleteGameIsBusy.value = false
  deleteGame.value = undefined
  deleteModal.value?.hide()
}
</script>
<template>
  <div>
    <div class="d-flex align-items-bottom justify-content-between">
      <p>All games list:</p>
    </div>
    <TableComp :fields="fields" :items="item.games">
      <template #teams="{ item }">
        {{
          item.teams
            ?.map(getTeam)
            .map((row: Team) => row.title)
            .join(' &times; ')
        }}
      </template>
      <template #actions="{ item }">
        <div class="d-flex justify-content-end gap-1">
          <RouterLink
            class="btn btn-light btn-sm"
            :to="{ name: 'admin-competition-edit-game', params: { gameId: item.id } }"
            >Edit</RouterLink
          >
          <ButtonComp variant="danger" size="sm" @click="handleConfirmDeleteGame(item)"
            >Delete</ButtonComp
          >
        </div>
      </template>
    </TableComp>
    <h5>Add game</h5>
    <form @submit="handleAddGame" class="d-flex align-items-end gap-2">
      <FieldComp label="Teams" class="flex-grow-1 d-flex flex-column gap-1">
        <TypeaheadSelectComp
          v-model="addGame.teams[0]"
          :options="gameTeamsOptions"
          placeholder="Select team..."
          required
        />
        <TypeaheadSelectComp
          v-model="addGame.teams[1]"
          :options="gameTeamsOptions"
          placeholder="Select team..."
          required
        />
      </FieldComp>
      <FieldComp label="Date" class="flex-grow-0 d-flex flex-column gap-1">
        <InputComp
          v-model="addGame.datetime"
          type="datetime-local"
          placeholder="Select date..."
          required
        />
        <ButtonComp variant="primary" type="submit" class="align-self-end">Add</ButtonComp>
      </FieldComp>
    </form>
    <ModalComp ref="deleteModal" title="Confirm detetion" ok-title="Delete" ok-variant="danger">
      <p>
        Sure to delete game
        <strong>{{
          deleteGame?.teams.map((teamId) => getTeam(teamId).title).join(' &times; ')
        }}</strong>
        from competition.
      </p>
      <template #modal-ok="{ okTitle, okVariant, okDisabled }">
        <ButtonComp
          :variant="okVariant"
          :disabled="okDisabled"
          :isBusy="deleteGameIsBusy"
          @click="handleDelete"
        >
          {{ okTitle }}
        </ButtonComp>
      </template>
    </ModalComp>
  </div>
</template>
