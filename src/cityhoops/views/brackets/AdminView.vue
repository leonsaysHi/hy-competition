<script lang="ts" setup>
import useBracketsLib, { type BracketItem } from '@/cityhoops/composable/useBracketsLib'
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import useCompetition from '@/composable/useCompetition'
import type { TableItem } from '@/types/comp-table'
import { computed, ref } from 'vue'
import { formatDate } from '@/utils/dates'
import type {
  CompetitionGroupComputed,
  CompetitionPhaseComputed,
  CompetitionStanding
} from '@/types/computed'
import type { ScoresComputed } from '@/models/GameComputed'
import type { TeamId } from '@/types/teams'
import type { BracketMatchup } from '@/types/competitions'
import FieldComp from '@/components/FieldComp.vue'
import CheckComp from '@/components/CheckComp.vue'

const competitionId = 'YNZaQiwQDMPHCWsE1KrQ'
const { computedPhases } = useCompetition(competitionId)
const { isReady, rows, admin, deleteRows, writeRows } = useBracketsLib()

const fields = [
  {
    key: 'id',
    label: '',
    tdClass: 'small text-body-secondary'
  },
  {
    key: 'title',
    label: 'Title',
    sortable: true
  },
  {
    key: 'dateCreated',
    label: 'Date',
    sortable: true
  },
  {
    key: 'points',
    label: 'Puntos',
    sortable: true
  },
  {
    key: 'actions',
    label: ''
  }
]

const canCreate = computed({
  get() {
    return admin.value?.canCreate
  },
  set(v: boolean) {
    writeRows([{ id: 'admin', canCreate: v }])
  }
})

const teams = computed(() => {
  return (
    selectedGroup.value?.standing.reduce((results: TeamId[], standing: CompetitionStanding) => {
      results.push(standing.teamId)
      return results
    }, []) || []
  )
})
const winners = computed(() => {
  return (
    selectedGroup.value?.bracket?.flat().reduce((results: TeamId[], matchup: BracketMatchup) => {
      const winner = matchup.game?.scores?.find((score: ScoresComputed) => score.winner)
      if (winner) results.push(winner.id)
      return results
    }, []) || []
  )
})

const items = computed<TableItem[]>(() => {
  return (
    rows.value?.map((row: BracketItem) => {
      const bracketwinners = row.winners.flat() as TeamId[]
      const points = teams.value.reduce((result: number, teamId: TeamId) => {
        const wins = winners.value.filter((tId: TeamId) => teamId === tId).length
        const bracketWins = bracketwinners.filter((tId: TeamId) => teamId === tId).length
        let corrects = Math.min(wins, bracketWins)
        let pts = 2
        while (corrects > 0) {
          result += pts
          pts *= 2
          corrects--
        }
        return result
      }, 0)
      return {
        ...row,
        points
      }
    }) || []
  )
})

const selectedGroup = computed<CompetitionGroupComputed | undefined>(() => {
  const idx: number = Array.isArray(computedPhases.value)
    ? computedPhases.value.findIndex((phase: CompetitionPhaseComputed) => phase.type === 'playoffs')
    : -1
  return Array.isArray(computedPhases.value) && idx > -1
    ? computedPhases.value[idx].groups[0]
    : undefined
})

// Delete game
const deleteModal = ref<typeof ModalComp>()
const deleteRow = ref<TableItem | undefined>()
const handleConfirmDeleteRow = (row: TableItem) => {
  deleteRow.value = row
  deleteModal.value?.show()
}
const handleDelete = async () => {
  const row = deleteRow.value
  await deleteRows([row as any])
  deleteModal.value?.hide()
}
</script>
<template>
  <div>
    <template v-if="!isReady || !selectedGroup">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else>
      <p class="hstack gap-3 align-items-baseline">
        <strong>Can create new brackets?</strong>
        No
        <CheckComp v-model="canCreate" :value="true" :uncheck-value="false" switch></CheckComp>
        Yes
      </p>
      <TableComp
        :fields="fields"
        :items="items"
        sorted-key="dateCreated"
        sorted-direction="asc"
        show-empty
      >
        <template #empty> <p class="text-body-secondary text-center">Ningun bracket.</p> </template
        ><template #points="{ value, item }">
          <strong>{{ value }}</strong>
        </template>
        <template #dateCreated="{ value }">
          {{ formatDate(value).long }}
          {{ formatDate(value).time }}
        </template>
        <template #actions="{ item }">
          <div class="hstack gap-2">
            <RouterLink
              class="btn btn-light btn-sm"
              :to="{ name: 'bracket-view', params: { bracketId: item.id } }"
            >
              <i class="bi bi-eye"></i>
            </RouterLink>
            <ButtonComp variant="danger" size="sm" @click="handleConfirmDeleteRow(item)"
              >Delete</ButtonComp
            >
          </div>
        </template>
      </TableComp>
      <ModalComp ref="deleteModal" title="Confirm detetion" ok-title="Delete" ok-variant="danger">
        <p>
          Sure to delete bracket
          <strong>{{ deleteRow?.title }}</strong
          >?
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
