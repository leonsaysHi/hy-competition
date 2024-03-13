<script lang="ts" setup>
import { isAfter } from 'date-fns'
import { useRoute, RouterLink } from 'vue-router'
import { ref, computed } from 'vue'
import type { TableField, TableItem } from '@/types/comp-table'
import TableComp from '@/components/TableComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import type { Option } from '@/types/comp-fields'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { Game } from '@/types/games'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'
import AddGameForm from '@/admin/competition/forms/AddGameForm.vue'
import { compareDesc } from 'date-fns'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import PhaseMenu from './components/PhaseMenu.vue'
import useCompetition from '@/composable/useCompetition'
import { formatDate } from '@/utils/dates'

const route = useRoute()
const { competitionId } = route.params
const { isReady: isLibsReady, getTeam, getTeamName } = useLibs()

const { row } = useCompetition(competitionId)
const { writeGame: addCompetitionGame, deleteGame: deleteCompetitionGame } =
  useCompetitionAdmin(competitionId)

const selectedPhase = ref('')

const gamesItems = computed(() => {
  const result = Array.isArray(row?.value?.games)
    ? row?.value?.games
        .filter((game: Game) => {
          if (!selectedPhase.value) {
            return true
          }
          const phase = row.value?.phases[Number(selectedPhase.value)]
          return isAfter(game.datetime, phase?.datetime)
        })
        .map((game: Game) => {
          return {
            ...game,
            game: game.teams.reduce((score, teamId: TeamId) => {
              const finalScore = game.scores[teamId]
                ? game.scores[teamId].reduce((tot, score) => tot + score, 0)
                : 0
              return {
                ...score,
                [teamId]: finalScore
              }
            }, {})
          }
        })
    : []
  result.sort((a: Game, b: Game) => compareDesc(a.datetime, b.datetime))
  return result
})

const fields: TableField[] = [
  { key: 'game', label: 'Games' },
  { key: 'datetime', label: 'Date' },
  { key: 'actions', label: '' }
]

const teamsOptionsByGroups = computed((): Option[][] => {
  const currentPhase = row.value?.phases[row.value?.phases.length - 1]
  const groups = currentPhase?.groups
  return Array.isArray(groups) && groups.length
    ? groups?.map((group: TeamId[]) => [
        ...group.map((teamId: TeamId) => ({
          value: teamId,
          text: getTeam(teamId)?.title
        }))
      ])
    : []
})

const isBusy = ref(false)
// Add game
const handleAddGame = async (data) => {
  isBusy.value = true
  await addCompetitionGame(data)
  setTimeout(() => {
    isBusy.value = false
  }, 150)
}

// Delete game
const deleteGame = ref<undefined | Game>()
const deleteModal = ref<typeof ModalComp>()
const handleConfirmDeleteGame = (row: TableItem) => {
  deleteGame.value = row as unknown as Game
  deleteModal.value?.show()
}
const handleDelete = async () => {
  isBusy.value = true
  await deleteCompetitionGame({ ...deleteGame.value })
  setTimeout(() => {
    isBusy.value = false
    deleteGame.value = undefined
    deleteModal.value?.hide()
  }, 150)
}
</script>
<template>
  <div>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active" aria-current="page">Games list</li>
      </ol>
    </nav>
    <template v-if="!isLibsReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <PhaseMenu v-model="selectedPhase" :phases="row?.phases" class="mb-2" />
      <TableComp :fields="fields" :items="gamesItems">
        <template #datetime="{ value }">
          <div class="vstack">
            <span>{{ formatDate(value).short }}</span>
            <span>{{ formatDate(value).time }}</span>
          </div>
        </template>
        <template #game="{ item }">
          <div class="score-col">
            <template v-for="(score, teamId) in item.game" :key="teamId">
              <div>{{ score }}</div>
              <strong>{{ getTeamName(teamId) }}</strong>
            </template>
          </div>
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
      <AddGameForm
        :teamsOptionsByGroups="teamsOptionsByGroups"
        :is-busy="isBusy"
        @submit="handleAddGame"
      />
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

<style lang="scss" scoped>
.score-col {
  display: grid;
  grid-template-columns: 2rem auto;
  column-gap: 0.25rem;
  row-gap: 0.25rem;
}
</style>
