<script lang="ts" setup>
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetitionComputed from '@/composable/useCompetitionComputed'
import { computed, ref } from 'vue'
import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import Standing from '@/views/competition/components/Standing.vue'
import Ranking from './components/Ranking.vue'
import GamesList from '@/components/games/GamesList.vue'
import type { Game, GameId } from '@/types/games'
const route = useRoute()
const { competitionId } = route.params

const { competitionPhases } = useOptionsLib()

const { isReady, row, games, computedRow } = useCompetitionComputed(competitionId)
const phasesOptions = computed<Option[] | undefined>(() =>
  Array.isArray(computedRow.value?.phases)
    ? computedRow.value.phases.map(
        (row: CompetitionPhaseComputed, idx): Option => ({
          value: idx.toString(),
          text: competitionPhases.find((opt) => opt.value === row.type)?.text as string
        })
      )
    : undefined
)
const selectedPhaseIdx = ref('0')
const selectedPhase = computed<CompetitionPhaseComputed>(
  () => computedRow.value?.phases[Number(selectedPhaseIdx.value)]
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

const groupGames = computed<Game[]>(() => {
  return selectedGroup.value.games.map((gameId: GameId) =>
    games.value?.find((game: Game) => game.id === gameId)
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
        `
        <h5>Standing</h5>
        <Standing :value="selectedGroup.standing" />
        <h5>Games</h5>
        <GamesList :games="groupGames" />
        <hr class="my-5" />
        <h5>Ranking</h5>
        <Ranking :value="selectedGroup.ranking" :length="5" />
      </template>
    </template>
  </div>
</template>
