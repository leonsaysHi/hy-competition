<script lang="ts" setup>
import { useRoute, RouterLink } from 'vue-router'
import { ref, inject } from 'vue'
import type { TableField, TableItem } from '@/types/comp-table'
import TableComp from '@/components/TableComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import { CompetitionKey, TeamsLibKey } from '@/types/symbols'

const route = useRoute()
const { competitionId } = route.params

const item = inject(CompetitionKey)
const teamsLib = inject(TeamsLibKey)

const fields: TableField[] = [
  { key: 'teams', label: 'Games' },
  { key: 'actions', label: '' }
]
const showGameTeams = (item: TableItem) => {
  return item.teams
    .map((teamId) => {
      return teamsLib.value.find((team) => teamId === team.id)
    })
    .map((i) => i.title)
    .join(' | ')
}

// Delete Game
const deleteGame = ref<undefined | Game | null>(null)
const handleConfirmDeleteGame = (row: TableItem) => {
  deleteGame.value = row as unknown as Game
}
</script>
<template>
  <div>
    <div class="d-flex align-items-bottom justify-content-between">
      <p>All games list:</p>
      <div class="d-flex justify-content-between gap-2">
        <RouterLink
          class="btn btn-light"
          :to="{ name: 'admin-competition-home', params: { competitionId } }"
          >Edit</RouterLink
        >
        <RouterLink
          class="btn btn-primary"
          :to="{ name: 'admin-competition-edit-game', params: { gameId: 'new' } }"
          >Add game</RouterLink
        >
      </div>
    </div>
    <TableComp :fields="fields" :items="item.games">
      <template #teams="{ item }">
        {{ showGameTeams(item) }}
      </template>
      <template #actions="{ item }">
        <div class="d-flex justify-content-end gap-1">
          <RouterLink
            class="btn btn-light btn-sm"
            :to="{ name: 'admin-competition-edit-game', params: { gameId: item.id } }"
            >Edit</RouterLink
          >
          <ButtonComp variant="danger" size="sm" @click="() => handleConfirmDeleteGame(item)"
            >Delete</ButtonComp
          >
        </div>
      </template>
    </TableComp>
  </div>
</template>
