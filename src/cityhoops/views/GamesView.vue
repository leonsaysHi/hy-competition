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
import useCompetition from '@/composable/useCompetition'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const { row, filterGames } = useCompetition(competitionId)
const { t } = useI18n()
const { selectedPhaseIdx, phasesOptions, selectedGroupIdx, selectedGroup, groupsOptions } =
  useCompetitionPhasesGroups()

type GameView = 'prev' | 'next'
const currentGamesView = ref<GameView>('prev')

const prevGamesList = computed(() => row.value 
  ? filterGames({
      phaseIdx: Number(selectedPhaseIdx.value),
      groupIdx: Number(selectedGroupIdx.value),
      isFinished: true,
      isLive: false
    })
    .reverse()
  : []
)
const nextGamesList = computed(() => row.value 
  ? filterGames({
      phaseIdx: Number(selectedPhaseIdx.value),
      groupIdx: Number(selectedGroupIdx.value),
      isFinished: false,
      isLive: false
    })
    .reverse()
  : []
)
const gamesList = computed<GameComputedClass[]>(() => {
  const result = row.value 
    ? currentGamesView.value === 'prev'
      ? prevGamesList.value
      : nextGamesList.value
    : []
  return result
})

const liveGamesList = computed<GameComputedClass[]>(() => {
  return row.value
    ? filterGames({
      phaseIdx: Number(selectedPhaseIdx.value),
      groupIdx: Number(selectedGroupIdx.value),
      isFinished: true,
      isLive: true
    })
    .reverse()
    : []
})

const gamesViewOptions = computed<Option[]>(() => {
  return [
    {
      text: t('global.previous', 2),
      value: 'prev',
      disabled: !prevGamesList.value.length
    },
    {
      text: t('global.upcoming', 2),
      value: 'next',
      disabled: !nextGamesList.value.length
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
      <GamesList class="mb-3" :items="gamesList" />
    </template>
  </div>
</template>
