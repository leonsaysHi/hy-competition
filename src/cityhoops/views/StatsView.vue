<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import ViewHero from '../components/layout/ViewHero.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useCompetitionPhasesGroups from '@/composable/useCompetitionPhasesGroups'
import { computed } from 'vue'
import type GameComputedClass from '@/models/GameComputed'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import type { CompetitionTeam, TeamId } from '@/types/team'

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const { row, getCompetitionTeam, filterGames } = useCompetition(competitionId)
const { selectedPhaseIdx, phasesOptions, groupsOptions, selectedGroupIdx, selectedGroup } =
  useCompetitionPhasesGroups()

const standingTeams = computed<CompetitionTeam[]>(() => {
  return Array.isArray(selectedGroup.value?.teams)
    ? selectedGroup.value.teams
      .map((teamId: TeamId) => getCompetitionTeam(teamId) as CompetitionTeam)
    : []
})

const standingGames = computed<GameComputedClass[]>(() => {
  const result = row.value 
    ? filterGames({
        phaseIdx: Number(selectedPhaseIdx.value),
        groupIdx: Number(selectedGroupIdx.value),
        isFinished: true,
        isLive: false
      })
      .reverse()
    : []
  return result
})

const rankingGames = computed<GameComputedClass[]>(() => {
  return row.value 
    ? filterGames({
      phaseIdx: Number(selectedPhaseIdx.value),
      groupIdx: Number(selectedGroupIdx.value),
      isFinished: true,
      isLive: false
    })
    : []
})

</script>
<template>
  <div>
    <ViewHero>
      <h1>Tabla y estadística</h1>
      <template #nav>
        <div class="vstack gap-1">
          <template v-if="phasesOptions && phasesOptions.length > 1">
            <DropdownComp
              v-model="selectedPhaseIdx"
              :options="phasesOptions"
              variant="light"
              size="lg"
              class="fw-bold fz-5"
              :disabled="phasesOptions.length === 1"
            />
          </template>
        </div>
      </template>
    </ViewHero>
    <template v-if="!selectedGroup">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else>
      <div class="d-flex justify-content-between gap-3">
        <h2>Tabla: {{ selectedGroup.name }}</h2>
        <div class="d-flex flex-column justify-content-end mb-2">
          <template v-if="groupsOptions && groupsOptions.length > 1">
            <RadioGroupComp v-model="selectedGroupIdx" :options="groupsOptions" buttons button-variant="light" />
          </template>
        </div>
      </div>
      <CompetitionStanding :teams="standingTeams" :games="standingGames" />
      <hr />
      <h2>Líderes por categorías</h2>
      <CompetitionRanking 
        :games="rankingGames" 
        :limit="25" 
        :show-avg="false"
      />
    </template>
  </div>
</template>
