<script lang="ts" setup>
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed } from 'vue'
import useOptionsLib from '@/composable/useOptionsLib'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import GamesList from '@/components/games/GamesList.vue'
import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'
import ViewHero from '../../components/layout/ViewHero.vue'
import useCompetitionPhasesGroups from '@/composable/useCompetitionPhasesGroups'
import BracketView from '@/components/bracket/BracketView.vue'
import type { CompetitionTeam } from '@/types/teams'
import type { TeamId } from '@/types/team'

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const { isReady, row, getCompetitionTeam, filterGames } = useCompetition(competitionId)
const {
  selectedPhaseIdx,
  selectedPhase,
  phasesOptions,
  selectedGroupIdx,
  selectedGroup,
  groupsOptions
} = useCompetitionPhasesGroups()
const { t } = useI18n()
const { getGender, getCategory } = useOptionsLib()

const selectedGames = computed<GameComputedClass[]>(() => {
  return row.value 
    ? filterGames({ 
      phaseIdx: Number(selectedPhaseIdx.value),
      groupIdx: Number(selectedGroupIdx.value),
      isFinished: true,
      isLive: false
    })
    : []
})

const standingTeams = computed<CompetitionTeam[]>(() => {
  return Array.isArray(selectedGroup.value?.teams)
    ? selectedGroup.value.teams
      .map((teamId: TeamId) => getCompetitionTeam(teamId) as CompetitionTeam)
    : []
})

const liveGamesList = computed<GameComputedClass[]>(() => {
  const result = filterGames({
    phaseIdx: Number(selectedPhaseIdx.value),
    groupIdx: Number(selectedGroupIdx.value),
    isFinished: false,
    isLive: true
  })
  const teamsLength = standingTeams.value.length ? Math.round(standingTeams.value.length * .5) : 4
  return result.slice(0, teamsLength) 
})

const nextGamesList = computed<GameComputedClass[]>(() => {
  const result = filterGames({
    phaseIdx: Number(selectedPhaseIdx.value),
    groupIdx: Number(selectedGroupIdx.value),
    isFinished: false,
    isLive: false
  })
  const teamsLength = standingTeams.value.length ? Math.round(standingTeams.value.length * .5) : 4
  return result.slice(0, teamsLength) 
})
</script>
<template>
  <div>
    <template v-if="!isReady">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else-if="!phasesOptions?.length">
      <p>Error: No phase.</p>
    </template>
    <template v-else>
      <ViewHero>
        <h1>{{ row?.title }}</h1>
        <div class="d-flex gap-3 align-items-start">
          <p>{{ getGender(row?.gender)?.long }}</p>
          <p>{{ getCategory(row?.category)?.text }}</p>
        </div>
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
            <template v-if="groupsOptions && groupsOptions.length > 1">
              <RadioGroupComp v-model="selectedGroupIdx" :options="groupsOptions" buttons button-variant="light" />
            </template>
          </div>
        </template>
      </ViewHero>

      <template v-if="selectedPhase && selectedGroup">
        <template v-if="liveGamesList.length">
        <h2>{{ t('global.liveGame', liveGamesList.length) }}</h2>
        <GamesList class="mb-3" :items="liveGamesList" />
        </template>
        <h2>{{ t('global.upcomingGame', nextGamesList.length) }}</h2>
        <GamesList class="mb-3" :items="nextGamesList" />
        <div class="mb-3 d-flex justify-content-center">
          <RouterLink
            class="btn btn-primary btn-lg text-white"
            :to="{ name: 'competition-games', params: { competitionId } }"
            >Ver Resultados</RouterLink
          >
        </div>
        <hr />
        <template v-if="selectedPhase.type === 'playoffs'">
          <h2>{{ t('global.playoffs') }}</h2>
          <BracketView :games="selectedGames" :teams="standingTeams" />
        </template>
        <template v-else>
          <h2>{{ t('global.standing') }}</h2>
          <CompetitionStanding :games="selectedGames" :teams="standingTeams" />
        </template>
        <div class="mb-3 d-flex justify-content-center">
          <RouterLink
            class="btn btn-primary btn-lg text-white"
            :to="{ name: 'competition-stats' }"
            >Ver tabla completa</RouterLink
          >
        </div>
      </template>
    </template>
  </div>
</template>
