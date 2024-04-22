<script lang="ts" setup>
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed, ref, watch } from 'vue'
import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'
import GamesList from '@/components/games/GamesList.vue'
import { compareAsc } from 'date-fns'
import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'
import ViewHero from '../components/layout/ViewHero.vue'

const route = useRoute()
const { competitionId } = route.params as { competitionId: string; phase: string }

const { t } = useI18n()

const { isReady, computedPhases } = useCompetition(competitionId)

const currentGamesView = ref<'prev' | 'next'>('prev')

const gamesList = computed<GameComputedClass[]>(() => {
  const result = Array.isArray(computedPhases?.value)
    ? computedPhases.value
      .reduce((acc: GameComputedClass[], phase: CompetitionPhaseComputed) => {
        phase.groups
          .forEach((group: CompetitionGroupComputed) => {
            acc.push(...group.games)
          }) 
        return acc
      }, [])
    : []
  result.sort((a: GameComputedClass, b: GameComputedClass) =>
    currentGamesView.value === 'prev'
      ? compareAsc(b.row.datetime, a.row.datetime)
      : compareAsc(a.row.datetime, b.row.datetime)
  )
  return result
})
const prevNextGamesList = computed<GameComputedClass[]>(() => {
  return gamesList.value
    .filter((game: GameComputedClass) => {
        return currentGamesView.value === 'prev'
          ? game.isFinished && !game.isLive
          : !game.isFinished && !game.isLive
      })
})
const liveGamesList = computed<GameComputedClass[]>(() => {
  return gamesList.value
    .filter((game: GameComputedClass) => !game.isFinished && game.isLive)
})

const gamesViewOptions = computed<Option[]>(() => {
  return [
    {
      text: t('global.previous', 2),
      value: 'prev',
      disabled:
        gamesList.value
          .some(
            (game: GameComputedClass) => game.isFinished && !game.isLive
          )
    },
    {
      text: t('global.upcoming', 2),
      value: 'next',
      disabled:
      gamesList.value
        .some(
          (game: GameComputedClass) => !game.isFinished && !game.isLive
        )
    }
  ]
})

watch(
  () => gamesViewOptions.value,
  (val: Option[]) => {
    const optIdx = val.findIndex((opt: Option) => !opt.disabled)
    currentGamesView.value = optIdx > -1 ? val[optIdx].value as 'prev' | 'next' : 'prev'
  }
)

</script>
<template>
  <div>
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <ViewHero>
        <h1>Resultados</h1>
      </ViewHero>
      <template v-if="liveGamesList.length">
        <h2>Ahora en vivo</h2>
        <GamesList class="mb-3" :items="liveGamesList" />
      </template>
      <div class="d-flex align-items-end justify-content-between">
        <h2>Juegos</h2>
        <ul class="nav nav-underline justify-content-end">
          <template v-for="opt in gamesViewOptions" :key="opt.value">
            <li class="nav-item">
              <a
                class="nav-link"
                :class="[currentGamesView === opt.value && 'active', opt.disabled && 'disabled']"
                :aria-current="currentGamesView === opt.value ? 'page' : false"
                @click="currentGamesView = opt.value"
                >{{ opt.text }}</a
              >
            </li>
          </template>
        </ul>
      </div>
      <GamesList class="mb-3" :items="prevNextGamesList" />
    </template>
  </div>
</template>
