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
import { compareAsc } from 'date-fns'
import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'
import ViewHero from '../components/layout/ViewHero.vue'
import useCompetitionPhasesGroups from '@/composable/useCompetitionPhasesGroups'
import BracketView from '@/components/bracket/BracketView.vue'

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

const nextGames = computed<GameComputedClass[]>(() => {
  const result = Array.isArray(selectedGroup.value?.games)
    ? selectedGroup.value.games.filter((game: GameComputedClass) => {
        return !game.isFinished || game.isLive
      })
    : []
  result.sort((a: GameComputedClass, b: GameComputedClass) =>
    compareAsc(a.row.datetime, b.row.datetime)
  )
  return result.slice(
    0,
    selectedGroup.value?.standing
      ? Math.max(
          Math.round(selectedGroup.value?.standing.length * 0.5),
          Math.min(4, selectedGroup.value?.standing.length)
        )
      : 5
  )
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
        </template>
      </ViewHero>

      <template v-if="selectedPhase && selectedGroup">
        <h2>{{ t('global.game', 2) }}</h2>
        <GamesList class="mb-3" :items="nextGames" />
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
          <CompetitionStanding :value="selectedGroup.standing" />
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
