<script lang="ts" setup>
import { ref, inject, computed } from 'vue'
import type CompetitionClass from '@/models/Competition'
import type { TableField, TableItem } from '@/types/comp-table'
import TableComp from '@/components/TableComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import { TeamsKey } from '@/types/symbols'

interface IProps {
  item?: CompetitionClass
}
const props = withDefaults(defineProps<IProps>(), {
  item: null
})

const teamsLib = inject(TeamsKey)
const fields: TableField = [
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
const editGame = ref<undefined | Game | null>(null)
const handleEdit = (row: TableItem) => {
  editGame.value = row as unknown as Game 
}

// Delete
const deleteGame = ref<undefined | Game | null>(null)
const handleConfirmDelete = (row: TableItem) => {
  deleteGame.value = row as unknown as Game
}
</script>
<template>
  <div>
    <h1>Competition admin</h1>
    <h5>{{ item.row.title }}</h5>
    <TableComp :fields="fields" :items="props.item.games">
      <template #teams="{ item }">
        {{ showGameTeams(item) }}
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

