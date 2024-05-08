<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import { computed, ref, watch } from 'vue'
import type { Option } from '@/types/comp-fields'
import GamesList from '@/components/games/GamesList.vue'
import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'
import ViewHero from '../components/layout/ViewHero.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useCompetitionPhasesGroups from '@/composable/useCompetitionPhasesGroups'

const { t } = useI18n()
const { selectedPhaseIdx, phasesOptions, selectedGroupIdx, selectedGroup, groupsOptions } =
  useCompetitionPhasesGroups()

type GameView = 'prev' | 'next'
const currentGamesView = ref<GameView>('prev')

const prevNextGamesList = computed<GameComputedClass[]>(() => {
  return selectedGroup.value?.games.filter((game: GameComputedClass) => {
    return currentGamesView.value === 'prev'
      ? game.isFinished && !game.isLive
      : !game.isFinished && !game.isLive
  })
})
const liveGamesList = computed<GameComputedClass[]>(() => {
  return (
    selectedGroup.value?.games.filter(
      (game: GameComputedClass) => !game.isFinished && game.isLive
    ) || []
  )
})

const gamesViewOptions = computed<Option[]>(() => {
  return [
    {
      text: t('global.previous', 2),
      value: 'prev',
      disabled: !selectedGroup.value?.games.some(
        (game: GameComputedClass) => game.isFinished && !game.isLive
      )
    },
    {
      text: t('global.upcoming', 2),
      value: 'next',
      disabled: !selectedGroup.value?.games.some(
        (game: GameComputedClass) => !game.isFinished && !game.isLive
      )
    }
  ]
})

const handleSetGamesView = (opt: Option) =>
  (currentGamesView.value = opt.value as unknown as GameView)

watch(
  () => gamesViewOptions.value,
  (val: Option[]) => {
    const optIdx = val.findIndex((opt: Option) => !opt.disabled)
    currentGamesView.value = optIdx > -1 ? (val[optIdx].value as 'prev' | 'next') : 'prev'
  },
  { immediate: true }
)
</script>
<template>
  <div>
    <template v-if="!selectedGroup">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else>
      <ViewHero>
        <h1>Resultados</h1>
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
            <RadioGroupComp v-model="selectedGroupIdx" :options="groupsOptions" buttons />
          </template>
        </template>
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
                :aria-current="currentGamesView === opt.value ? 'page' : 'false'"
                @click="handleSetGamesView(opt)"
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
