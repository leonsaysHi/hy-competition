<script lang="ts" setup>
import type { TableField, TableItem } from '@/types/comp-table'
import TableComp from '@/components/TableComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import { CompetitionsKey, TeamsKey } from '@/types/symbols'
import useGames from '@/composable/useGames'
import type { Competition, CompetitionId } from '@/types/competitions'
import type { Game } from '@/types/games'
import type { Ref } from 'vue'
import { inject, computed } from 'vue'
import { useRoute } from 'vue-router'

const competitions = inject(CompetitionsKey)
const teams = inject(TeamsKey)
const route = useRoute()
const { competitionId } = route.params

const { getCompetitionRows: getCompetitionGames } = useGames()
const row = competitions.value.find(r => r.id === competitionId) as Competition
const games = getCompetitionGames(competitionId as CompetitionId) as Ref<Game[] | undefined>
const computedGames = computed(() => {
  return Array.isArray(games.value) ? games.value
    .map((game: Game) => ({
      ...game,
      teams: game.teams.map((teamId):Team => {
        return teams.value.find((t:Team) => t.id === teamId)
      })
    }))
    : []
})
const fields: TableField[] = [
  {
    key: 'teams',
    label: 'Teams'
  },
  {
    key: 'datetime',
    label: 'Date/Time'
  },
  {
    key: 'actions',
    label: ''
  }
]
// Create / Edit
const handleEdit = (row: TableItem) => {
  console.log(row)
}
const handleCreate = () => {}

// Delete
const handleConfirmDelete = (row: TableItem) => {
  console.log(row)
}
</script>
<template>
  <div>
    <h1>Competition admin</h1>
    <h5>{{  row.title }}</h5>
    <p>{{ row }}</p>
    <div class="d-flex align-items-bottom justify-content-between">
      <p>All games list:</p>
      <ButtonComp variant="primary" @click="handleCreate">Create</ButtonComp>
    </div>
    <TableComp :fields="fields" :items="computedGames">
      <template #teams="{ item }"> {{ 
        item.teams
          .map(t => t.title)
          .join(' &times; ') }} 
      </template>
      <template #actions="{ item }">
        <div class="d-flex justify-content-end gap-1">
          <ButtonComp variant="light" size="sm" @click="() => handleEdit(item)">Edit</ButtonComp>
          <ButtonComp variant="danger" size="sm" @click="() => handleConfirmDelete(item)"
            >Delete</ButtonComp
          >
        </div>
      </template>
    </TableComp>
  </div>
</template>
