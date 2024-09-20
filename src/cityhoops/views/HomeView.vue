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
import ViewHero from '../components/layout/ViewHero.vue'
import useCompetitionPhasesGroups from '@/composable/useCompetitionPhasesGroups'
import BracketView from '@/components/bracket/BracketView.vue'
import GamesClass from '@/models/Games'

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const { isReady, row } = useCompetition(competitionId)
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
  console.log('>>>')
  return row.value ? 
    new GamesClass(row.value, row.value?.games)
      .phase(Number(selectedPhaseIdx.value))
      .group(Number(selectedGroupIdx.value))
      .finished(true)
      .live(false)
      .getComputed()
    : []
})

const nextGamesList = computed<GameComputedClass[]>(() => {
  const result = row.value 
    ? new GamesClass(row.value, row.value?.games)
      .phase(Number(selectedPhaseIdx.value))
      .group(Number(selectedGroupIdx.value))
      .finished(false)
      .live(false)
      .getComputed()
    : []
  const teamsLength = Array.isArray(selectedGroup.value?.standing) ? Math.round(selectedGroup.value.standing.length * .5) : 4
  return Array.isArray(selectedGroup.value?.standing)
    ? result.slice(0, teamsLength) 
    : result
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
        <h2>{{ t('global.game', 2) }}</h2>
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
          <h3>{{ t('global.playoffs') }}</h3>
          <BracketView :bracket="selectedGroup.bracket" />
        </template>
        <template v-else>
          <h3>{{ t('global.standing') }}</h3>
          <CompetitionStanding :games="selectedGames" />
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
