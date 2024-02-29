<script lang="ts" setup>
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed, ref } from 'vue'
import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import GamesList from '@/components/games/GamesList.vue'
import type { Game, GameId } from '@/types/games'
const route = useRoute()
const { competitionId } = route.params

const { competitionPhases } = useOptionsLib()

const { isReady, row, games, competitionClass } = useCompetition(competitionId)

const phasesOptions = computed<Option[] | undefined>(() =>
  Array.isArray(competitionClass.value?.computedPhases)
    ? competitionClass.value.computedPhases.map(
        (row: CompetitionPhaseComputed, idx): Option => ({
          value: idx.toString(),
          text: competitionPhases.find((opt) => opt.value === row.type)?.text as string
        })
      )
    : undefined
)
const selectedPhaseIdx = ref('0')
const selectedPhase = computed<CompetitionPhaseComputed>(
  () =>
    competitionClass.value?.computedPhases[
      Number(selectedPhaseIdx.value)
    ] as CompetitionPhaseComputed
)

const selectedGroupIdx = ref('0')
const groupsOptions = computed<Option[] | undefined>(() =>
  Array.isArray(selectedPhase.value?.groups)
    ? selectedPhase.value?.groups.map(
        (row: CompetitionGroupComputed, idx): Option => ({
          value: idx.toString(),
          text: 'Group ' + (idx + 1)
        })
      )
    : undefined
)
const selectedGroup = computed<CompetitionGroupComputed>(
  () => selectedPhase.value.groups[Number(selectedGroupIdx.value)]
)

const gamesViewOptions: Option[] = [
  { text: 'Upcoming', value: 'next' },
  { text: 'Lasts', value: 'prev' }
]
const currentGamesView = ref<'prev' | 'next'>('prev')
const groupGames = computed<Game[]>(() => {
  return selectedGroup.value.games
    .map((gameId: GameId): Game => games.value?.find((game: Game) => game.id === gameId) as Game)
    .filter((game: Game) =>
      currentGamesView.value === 'prev' ? game.isFinished : !game.isFinished
    )
})
</script>
<template>
  <div>
    <h1>{{ row?.title }}</h1>
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else-if="!phasesOptions">
      <p>Error: No phase.</p>
    </template>
    <template v-else>
      <template v-if="phasesOptions.length > 1">
        <ul class="nav nav-tabs">
          <template v-for="opt in phasesOptions" :key="opt.value">
            <li class="nav-item">
              <a
                class="nav-link active"
                :class="{ active: selectedPhaseIdx === opt.value }"
                :aria-current="selectedPhaseIdx === opt.value ? 'page' : false"
                @click="selectedPhaseIdx = opt.value"
                >{{ opt.text }}</a
              >
            </li>
          </template>
        </ul>
      </template>

      <template v-if="groupsOptions">
        <template v-if="groupsOptions.length > 1">
          <RadioGroupComp v-model="selectedGroupIdx" :options="groupsOptions" buttons />
        </template>
        <h5>Standing</h5>
        <CompetitionStanding :value="selectedGroup.standing" />
        <div class="d-flex align-items-end justify-content-between">
          <h5>Games</h5>
          <ul class="nav nav-underline justify-content-end">
            <template v-for="opt in gamesViewOptions" :key="opt.value">
              <li class="nav-item">
                <a
                  class="nav-link"
                  :class="[currentGamesView === opt.value && 'active']"
                  :aria-current="currentGamesView === opt.value ? 'page' : false"
                  href="#"
                  @click="currentGamesView = opt.value"
                  >{{ opt.text }}</a
                >
              </li>
            </template>
          </ul>
        </div>
        <GamesList :items="groupGames" />
        <hr class="my-5" />
        <h5>Ranking</h5>
        <CompetitionRanking :value="selectedGroup.ranking" :length="5" />
      </template>
    </template>
  </div>
</template>
