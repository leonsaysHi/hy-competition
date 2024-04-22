<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed, ref, watch, watchEffect } from 'vue'
import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import GamesList from '@/components/games/GamesList.vue'
import { compareAsc } from 'date-fns'
import { useI18n } from 'vue-i18n'
import type GameComputedClass from '@/models/GameComputed'

const route = useRoute()
const router = useRouter()
const { competitionId, phase } = route.params as { competitionId: string; phase: string }

const { t } = useI18n()
const { competitionPhases } = useOptionsLib()

const { isReady, computedPhases } = useCompetition(competitionId)

const selectedPhaseIdx = ref<string | undefined>(phase || undefined)
const selectedGroupIdx = ref<string | undefined>(route.hash?.substring(1) || undefined)

const selectedPhase = computed<CompetitionPhaseComputed | undefined>(() =>
  Array.isArray(computedPhases?.value) && selectedPhaseIdx.value
    ? (computedPhases.value[Number(selectedPhaseIdx.value)] as CompetitionPhaseComputed)
    : undefined
)
const selectedGroup = computed<CompetitionGroupComputed | undefined>(() =>
  Array.isArray(selectedPhase.value?.groups) && selectedGroupIdx.value
    ? selectedPhase.value?.groups[Number(selectedGroupIdx.value)]
    : undefined
)

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

watchEffect(() => {
  if (selectedPhaseIdx.value === undefined) {
    selectedPhaseIdx.value = Array.isArray(phasesOptions.value)
      ? phasesOptions.value[phasesOptions.value.length - 1].value
      : undefined
    selectedGroupIdx.value = '0'
  }
})
watchEffect(() => {
  router.replace({
    ...route,
    params: { phase: selectedPhaseIdx.value },
    hash: `#${selectedGroupIdx.value}`
  })
})

const gamesViewOptions = computed<Option[]>(() => {
  return [
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
    currentGamesView.value = val[optIdx].value as 'prev' | 'next' | 'live'
  }
)

const groupGames = computed<GameComputedClass[]>(() => {
  const result = Array.isArray(selectedGroup.value?.games)
    ? selectedGroup.value.games.filter((game: GameComputedClass) => {
        return currentGamesView.value === 'prev'
          ? game.isFinished && !game.isLive
          : !game.isFinished && !game.isLive
      })
    : []
  result.sort((a: GameComputedClass, b: GameComputedClass) =>
    currentGamesView.value === 'prev'
      ? compareAsc(b.row.datetime, a.row.datetime)
      : compareAsc(a.row.datetime, b.row.datetime)
  )
  return result.slice(
    0,
    Math.max(
      Math.round(selectedGroup.value.standing.length * 0.5),
      Math.min(4, selectedGroup.value.standing.length)
    )
  )
})
const groupLiveGames = computed<GameComputedClass[]>(() => {
  const result = Array.isArray(selectedGroup.value?.games)
    ? selectedGroup.value.games.filter((game: GameComputedClass) => !game.isFinished && game.isLive)
    : []
  result.sort((a: GameComputedClass, b: GameComputedClass) =>
    currentGamesView.value === 'prev'
      ? compareAsc(b.row.datetime, a.row.datetime)
      : compareAsc(a.row.datetime, b.row.datetime)
  )
  return result.slice(
    0,
    Math.max(
      Math.round(selectedGroup.value.standing.length * 0.5),
      Math.min(4, selectedGroup.value.standing.length)
    )
  )
})
</script>
<template>
  <div>
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else-if="!phasesOptions?.length || !groupsOptions?.length">
      <p>Error: No phase.</p>
    </template>
    <template v-else>
      <div class="p-5 mb-4 bg-body-tertiary rounded-3">
        <h1>Resultados</h1>
        <div class="hstack gap-3">
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
      </div>
      
      <template v-if="selectedPhase && selectedGroup">
        <template v-if="groupLiveGames.length">
          <h2>Ahora en vivo</h2>
          <GamesList class="mb-3" :items="groupLiveGames" />
        </template>
        <div class="d-flex align-items-end justify-content-between">
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
      </template>
    </template>
  </div>
</template>
