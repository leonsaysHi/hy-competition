<script lang="ts" setup>
import { ref, inject } from 'vue'
import type { TableField, TableItem } from '@/types/comp-table'
import ButtonComp from '@/components/ButtonComp.vue'
import TableComp from '@/components/TableComp.vue'
import { TeamsLibKey, CompetitionKey } from '@/types/symbols'
import type { CompetitionTeam, Team, TeamId } from '@/types/teams'

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

// Delete Team
const deleteTeam = ref<undefined | CompetitionTeam | null>(null)
const handleConfirmDeleteTeam = (row: TableItem) => {
  deleteTeam.value = row as unknown as CompetitionTeam
}
</script>
<template>
  <div>
    <div class="d-flex align-items-bottom justify-content-between">
      <p>All Teams list:</p>
      <div class="d-flex justify-content-between gap-2">
        <RouterLink
          class="btn btn-primary"
          :to="{ name: 'admin-competition-edit-team', params: { teamId: 'new' } }"
          >Add Team</RouterLink
        >
      </div>
    </div>
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
            >Delete</ButtonComp
          >
        </div>
      </template>
    </TableComp>
  </div>
</template>
