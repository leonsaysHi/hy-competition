<script lang="ts" setup>
import useBracketsLib, { type BracketItem } from '@/cityhoops/composable/useBracketsLib'
import PaginationComp from '@/components/PaginationComp.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import useCompetition from '@/composable/useCompetition'
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
import useAuthentification from '@/composable/useAuthentification'

const { isAdmin } = useAuthentification()
const competitionId = 'YNZaQiwQDMPHCWsE1KrQ'
const { computedPhases } = useCompetition(competitionId)
const { isReady, rows, admin } = useBracketsLib()

const fields = [
  {
    key: 'points',
    label: 'Puntos',
    sortable: true
  },
  {
    key: 'title',
    label: 'Titulo',
    sortable: true
  },
  {
    key: 'dateCreated',
    label: 'Fecha',
    sortable: true
  },
  {
    key: 'actions',
    label: ''
  }
]

const currentPage = ref<number>(1)
const perPage = ref<number>(25)

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

const items = computed(() => {
  if (!admin.value?.canCreate) {
    return []
  }
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
</script>
<template>
  <div>
    <template v-if="!isReady || !selectedGroup">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else>
      <template v-if="isAdmin">
        <div class="mb-3 hstack justify-content-end">
          <RouterLink
            class="btn btn-light"
            :to="{ name: 'bracket-admin', params: { competitionId } }"
            >Admin</RouterLink
          >
        </div>
      </template>
      <TableComp
        :fields="fields"
        :items="items"
        :current-page="currentPage"
        :per-page="perPage"
        sorted-key="points"
        sorted-direction="desc"
        show-empty
      >
        <template #empty>
          <p class="text-body-secondary text-center">
            <template v-if="!admin.value?.canCreate"> No se puede ver los brackets aun </template>
            <template v-else> Ningun bracket por ahora </template>
            .
          </p>
        </template>
        <template #points="{ value, item }">
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
          </div>
        </template>
      </TableComp>
      <div class="hstack justify-content-center">
        <PaginationComp v-model="currentPage" :per-page="perPage" :items="items" />
      </div>
    </template>
  </div>
</template>
