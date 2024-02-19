<script lang="ts" setup>
import { useRoute, RouterLink } from 'vue-router'
import { ref, computed } from 'vue'
import type { TableField, TableItem } from '@/types/comp-table'
import TableComp from '@/components/TableComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import type { Option } from '@/types/comp-fields'
import type { CompetitionTeam, Team } from '@/types/teams'
import type { Game } from '@/types/games'
import useCompetition from '@/composable/useCompetition'
import AddGameForm from '@/admin/competition/forms/AddGameForm.vue'

import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'

const route = useRoute()
const { competitionId } = route.params

const { isReady: isLibsReady, getTeam } = useLibs()
const {
  row,
  addGame: addCompetitionGameDoc,
  deleteGame: deleteCompetitionGameDoc
} = useCompetition(competitionId)

const gamesItems = computed(() => row?.value?.games || [])

const fields: TableField[] = [
  { key: 'teams', label: 'Games' },
  { key: 'datetime', label: 'Date' },
  { key: 'actions', label: '' }
]

const teamsOptions = computed((): Option[] => {
  return Array.isArray(row?.value?.teams)
    ? row?.value?.teams?.map((row: CompetitionTeam): Option => {
        const team = getTeam(row.id)
        return {
          value: team.id,
          text: team.title
        }
      })
    : []
})

// Add game
const handleAddGame = async (data) => {
  await addCompetitionGameDoc(data)
}

// Delete game
const deleteGame = ref<undefined | Game>()
const deleteModal = ref<typeof ModalComp>()
const handleConfirmDeleteGame = (row: TableItem) => {
  deleteGame.value = row as unknown as Game
  deleteModal.value?.show()
}
const handleDelete = async () => {
  await deleteCompetitionGameDoc({ ...deleteGame.value })
  deleteGame.value = undefined
  deleteModal.value?.hide()
}
</script>
<template>
  <div>
    <p>All games list:</p>
    <template v-if="!isLibsReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <TableComp :fields="fields" :items="gamesItems">
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
      <AddGameForm :teamsOptions="teamsOptions" @submit="handleAddGame" />
      <ModalComp ref="deleteModal" title="Confirm detetion" ok-title="Delete" ok-variant="danger">
        <p>
          Sure to delete game
          <strong>{{
            deleteGame?.teams.map((teamId) => getTeam(teamId).title).join(' &times; ')
          }}</strong>
          from competition.
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
