<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed, ref, watch } from 'vue'
import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import GamesList from '@/components/games/GamesList.vue'
import type { Game } from '@/types/games'

import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'
const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const { competitionId } = route.params as { competitionId: string }

const { competitionPhases, getGender, getCategory } = useOptionsLib()

const { isReady, row, computedPhases } = useCompetition(competitionId)

const phasesOptions = computed<Option[] | undefined>(() =>
  Array.isArray(computedPhases.value)
    ? computedPhases.value?.map(
        (row: CompetitionPhaseComputed, idx): Option => ({
          value: idx.toString(),
          text: competitionPhases.find((opt) => opt.value === row.type)?.text as string
        })
      )
    : undefined
)
const selectedPhaseIdx = ref(0)
const selectedPhase = computed<CompetitionPhaseComputed>(
  () => computedPhases.value[Number(selectedPhaseIdx.value)] as CompetitionPhaseComputed
)
const selectedGroupIdx = ref(route.hash ? route.hash.substring(1) : '0')
watch(
  () => selectedGroupIdx.value,
  (val: number) => {
    router.replace({ ...route, hash: `#${val}` })
  }
)
const groupsOptions = computed<Option[] | undefined>(() =>
  Array.isArray(selectedPhase.value?.groups)
    ? selectedPhase.value?.groups.map(
        (row: CompetitionGroupComputed, idx): Option => ({
          value: idx.toString(),
          text: t('global.group') + ` ${idx + 1}`
        })
      )
    : undefined
)
const selectedGroup = computed<CompetitionGroupComputed>(
  () => selectedPhase.value.groups[Number(selectedGroupIdx.value)]
)

const gamesViewOptions: Option[] = [
  { text: t('global.previous', 2), value: 'prev' },
  { text: t('global.upcoming', 2), value: 'next' }
]
const currentGamesView = ref<'prev' | 'next'>(gamesViewOptions[gamesViewOptions.length - 1].value)
const groupGames = computed<Game[]>(() => {
  return selectedGroup.value.games
    .filter((game: GameComputedClass) =>
      currentGamesView.value === 'prev' ? game.isFinished : !game.isFinished
    )
    .slice(
      0,
      Math.max(
        Math.round(selectedGroup.value.standing.length * 0.5),
        Math.max(4, selectedGroup.value.standing.length)
      )
    )
})
</script>
<template>
  <div>
    <h1>{{ row?.title }}</h1>
    <div class="d-flex gap-3 align-items-start">
      <p>{{ row?.date }}</p>
      <p>{{ getGender(row?.gender)?.long }}</p>
      <p>{{ getCategory(row?.category)?.text }}</p>
    </div>

    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else-if="!phasesOptions">
      <p>Error: No phase.</p>
    </template>
    <template v-else>
      <template v-if="phasesOptions.length > 1">
        <ul class="mb-3 nav nav-tabs">
          <template v-for="opt in phasesOptions" :key="opt.value">
            <li class="nav-item">
              <a
                class="nav-link"
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
          <hr />
        </template>
        <h3>{{ t('global.standing') }}</h3>
        <CompetitionStanding :value="selectedGroup.standing" />
        <div class="d-flex align-items-end justify-content-between">
          <h3>{{ t('global.game', 2) }}</h3>
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
        <GamesList class="mb-3" :items="groupGames" />
        <h3>{{ t('global.ranking') }}</h3>
        <CompetitionRanking :value="selectedGroup.ranking" :length="5" />
      </template>
    </template>
  </div>
</template>
