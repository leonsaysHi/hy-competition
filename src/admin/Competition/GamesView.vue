<script lang="ts" setup>
import { useRoute, RouterLink } from 'vue-router'
import { ref, inject } from 'vue'
import type CompetitionClass from '@/models/Competition'
import type { TableField, TableItem } from '@/types/comp-table'
import TableComp from '@/components/TableComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import GamesForm from './GamesForm.vue'
import { TeamsKey } from '@/types/symbols'

const route = useRoute()
const { competitionId } = route.params

interface IProps {
  item?: CompetitionClass
}
const props = withDefaults(defineProps<IProps>(), {
  item: null
})

const teamsLib = inject(TeamsKey)
const fields: TableField[] = [
  { key: 'teams', label: 'Games' },
  { key: 'actions', label: '' }
]
const showGameTeams = (item: TableItem) => {
  return  item.teams
    .map(teamId => {
      return teamsLib.value.find(team => teamId === team.id)
    })
    .map(i => i.title)
    .join(' | ')
}

// Create / Edit
const editCompetition = ref<undefined | Competition | null>(null)
const editModal = ref<typeof ModalComp>()
const handleCreate = () => {
  editCompetition.value = undefined
  editModal.value?.show()
}
const handleEdit = (row: TableItem) => {
  editCompetition.value = row as unknown as Game 
  editModal.value?.show()
}
const handleEditDone = () => {
  editCompetition.value = null
  editModal.value?.hide()
}

// Create / Edit Game
const editGame = ref<undefined | Game | null>(null)
const editGameModal = ref<typeof ModalComp>()
const handleCreateGame = () => {
  editGame.value = undefined
  editGameModal.value?.show()
}
const handleEditGame = (row: TableItem) => {
  editGame.value = row as unknown as Game 
  editGameModal.value?.show()
}
const handleEditGameDone = () => {
  editGame.value = null
  editGameModal.value?.hide()
}

// Delete Game
const deleteGame = ref<undefined | Game | null>(null)
const handleConfirmDeleteGame = (row: TableItem) => {
  deleteGame.value = row as unknown as Game
}
</script>
<template>
  <div>
    <h5>{{ item.row.title }}</h5>
    <p>{{ item.teams }}</p>
    <div class="d-flex align-items-bottom justify-content-between">
      <p>All games list:</p>
      <div class="d-flex justify-content-between gap-2">
        <RouterLink class="btn btn-light" :to="{ name: 'admin-competition-home', params: { competitionId } }">Edit</RouterLink>         
        <ButtonComp variant="primary" @click="handleCreate">Add game</ButtonComp>
      </div>
    </div>
    <TableComp :fields="fields" :items="props.item.games">
      <template #teams="{ item }">
        {{ showGameTeams(item) }}
      </template>
      <template #actions="{ item }">
        <div class="d-flex justify-content-end gap-1">
          <ButtonComp variant="light" size="sm" @click="() => handleEditGame(item)">Edit</ButtonComp>
          <ButtonComp variant="danger" size="sm" @click="() => handleConfirmDeleteGame(item)"
            >Delete</ButtonComp
          >
        </div>
      </template>
    </TableComp>
    <ModalComp ref="editGameModal" title="Edit game" hide-footer>
      <GamesForm :row="editGame" @done="handleEditGameDone" />
    </ModalComp>
  </div>
</template>

