<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import BracketView from '@/components/bracket/BracketView.vue'
import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import { computed, ref, watch } from 'vue'
import type { Bracket, BracketMatchup, BracketRound } from '@/types/competitions'
import type { TeamId } from '@/types/teams'
import type { ScoresComputed } from '@/models/GameComputed'
import useLibs from '@/composable/useLibs'

export type BracketSelection = TeamId[][]
const competitionId = 'YNZaQiwQDMPHCWsE1KrQ'
const { isReady, computedPhases } = useCompetition(competitionId)
const { getTeam } = useLibs()
const selectedGroup = computed<CompetitionGroupComputed | undefined>(() => {
  const idx: number = Array.isArray(computedPhases.value)
    ? computedPhases.value.findIndex((phase: CompetitionPhaseComputed) => phase.type === 'playoffs')
    : -1
  return Array.isArray(computedPhases.value) && idx > -1
    ? computedPhases.value[idx].groups[0]
    : undefined
})

const emptyBracket = ref<Bracket | undefined>()
const gotEmptyBracket = watch(
  () => selectedGroup.value?.bracket,
  (bracket: Bracket | undefined) => {
    if (Array.isArray(bracket) && bracket.length > 0) {
      emptyBracket.value = bracket.map((round: BracketRound, roundIdx: number) => {
        return round.map(
          (matchup: BracketMatchup) =>
            ({
              ...matchup,
              game: roundIdx > 0 ? {} : matchup.game
            }) as BracketMatchup
        )
      })
      gotEmptyBracket()
    }
  },
  { immediate: true }
)
const selection = ref<BracketSelection>([])
const createdBracket = computed<Bracket>((): Bracket => {
  return emptyBracket.value
    ? emptyBracket.value.map((round: BracketRound, roundIdx: number) => {
        return round.map((matchup: BracketMatchup) => {
          const scores = matchup.winnersFrom
            ? matchup.winnersFrom.reduce(
                (acc: (ScoresComputed | undefined)[], mu: BracketMatchup) => {
                  const { roundIdx, roundGameIdx } = mu
                  const teamId =
                    selection.value && selection.value[roundIdx]
                      ? selection.value[roundIdx][roundGameIdx]
                      : undefined
                  acc.push(
                    teamId
                      ? ({
                          ...getTeam(teamId),
                          id: teamId,
                          winner: false,
                          finalScore: 0
                        } as ScoresComputed)
                      : undefined
                  )
                  return acc
                },
                [] as (ScoresComputed | undefined)[]
              )
            : []
          return {
            ...matchup,
            game: roundIdx > 0 ? { scores } : matchup.game
          }
        })
      })
    : ([] as Bracket)
})
const handleSelectWinner = (matchup: BracketMatchup, teamId: TeamId) => {
  const { roundIdx, roundGameIdx } = matchup
  const result: TeamId[][] = [...(Array.isArray(selection.value) ? selection.value : [])]
  result[roundIdx] = [...(Array.isArray(result[roundIdx]) ? result[roundIdx] : [])]
  result[roundIdx][roundGameIdx] = teamId
  selection.value = result
}
</script>
<template>
  <div>
    <template v-if="!isReady">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else-if="!computedPhases?.length">
      <p>Error: No phase.</p>
    </template>
    <template v-else>
      <BracketView :bracket="createdBracket" :selection="selection" @select="handleSelectWinner" />
      {{ selection }}
    </template>
  </div>
</template>
