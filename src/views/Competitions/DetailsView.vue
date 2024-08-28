<script lang="ts" setup>
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed, ref, watch } from 'vue'
import type { Option } from '@/types/comp-fields'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import GamesList from '@/components/games/GamesList.vue'
import { compareAsc } from 'date-fns'
import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'
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

const gamesViewOptions = computed<Option[]>(() => {
  return [
    {
      text: t('global.gameDetails.live'),
      value: 'live',
      disabled:
        !selectedGroup.value ||
        !selectedGroup.value?.games.some((game: GameComputedClass) => game.isLive)
    },
    {
      text: t('global.previous', 2),
      value: 'prev',
      disabled:
        !selectedGroup.value ||
        !selectedGroup.value?.games.some(
          (game: GameComputedClass) => game.isFinished && !game.isLive
        )
    },
    {
      text: t('global.upcoming', 2),
      value: 'next',
      disabled:
        !selectedGroup.value ||
        !selectedGroup.value?.games.some(
          (game: GameComputedClass) => !game.isFinished && !game.isLive
        )
    }
  ]
})

const currentGamesView = ref<'prev' | 'next' | 'live'>('prev')

watch(
  () => gamesViewOptions.value,
  (val: Option[]) => {
    const optIdx = val.findIndex((opt: Option) => !opt.disabled)
    if (optIdx > -1) {
      currentGamesView.value = val[optIdx].value as 'prev' | 'next' | 'live'
    }
  }
)

const groupGames = computed<GameComputedClass[]>(() => {
  const games = Array.isArray(selectedGroup.value?.games) ? selectedGroup.value.games.slice() : []
  const result = games
    .filter((game: GameComputedClass) => {
      return currentGamesView.value === 'prev'
        ? game.isFinished && !game.isLive
        : currentGamesView.value === 'next'
          ? !game.isFinished && !game.isLive
          : !game.isFinished && game.isLive
    })
  result.sort((a: GameComputedClass, b: GameComputedClass) =>
    currentGamesView.value === 'prev'
      ? compareAsc(b.row.datetime, a.row.datetime)
      : compareAsc(a.row.datetime, b.row.datetime)
  )
  return Array.isArray(selectedGroup.value?.standing)
    ? result.slice(
      0,
      Math.max(
        Math.round(selectedGroup.value.standing.length * 0.5),
        Math.min(4, selectedGroup.value.standing.length)
      )
    ) 
    : result
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
    <template v-else-if="!phasesOptions?.length || !groupsOptions?.length">
      <p>Error: No phase.</p>
    </template>
    <template v-else>
      <div class="mb-3 hstack gap-3">
        <DropdownComp
          v-model="selectedPhaseIdx"
          :options="phasesOptions"
          variant="light"
          size="lg"
          class="fw-bold fz-5"
          :disabled="phasesOptions.length === 1"
        />
        <template v-if="groupsOptions.length > 1">
          <RadioGroupComp v-model="selectedGroupIdx" :options="groupsOptions" buttons />
        </template>
      </div>
      <hr />
      <template v-if="selectedPhase && selectedGroup">
        <template v-if="selectedPhase.type === 'playoffs'">
          <h3>{{ t('global.playoffs') }}</h3>
          <BracketView :bracket="selectedGroup.bracket" />
        </template>
        <template v-else>
          <h3>{{ t('global.standing') }}</h3>
          <CompetitionStanding :value="selectedGroup.standing" />
        </template>
        <div class="d-flex align-items-end justify-content-between">
          <h3>{{ t('global.game', 2) }}</h3>
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
        <GamesList class="mb-3" :items="groupGames" />
        <CompetitionRanking :value="selectedGroup.ranking" :limit="15">
          <template #title>
            <h3>{{ t('global.ranking') }}</h3>
          </template>
        </CompetitionRanking>
      </template>
    </template>
  </div>
</template>
