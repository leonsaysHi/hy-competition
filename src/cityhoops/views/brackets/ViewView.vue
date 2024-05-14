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

import useBracketsLib, { type BracketItem } from '@/cityhoops/composable/useBracketsLib'
import { useRoute } from 'vue-router'
import FieldComp from '@/components/FieldComp.vue'
import useAuthentification from '@/composable/useAuthentification'
import TeamLogo from '@/components/teams/TeamLogo.vue'

const competitionId = 'YNZaQiwQDMPHCWsE1KrQ'

const { isAdmin } = useAuthentification()
const route = useRoute()
const { bracketId } = route.params as { bracketId: string }

const { isReady: isBracketReady, rows } = useBracketsLib()
const { isReady: isCompetitionReady, computedPhases } = useCompetition(competitionId)

const { getTeam } = useLibs()

const selectedGroup = computed<CompetitionGroupComputed | undefined>(() => {
  const idx: number = Array.isArray(computedPhases.value)
    ? computedPhases.value.findIndex((phase: CompetitionPhaseComputed) => phase.type === 'playoffs')
    : -1
  return Array.isArray(computedPhases.value) && idx > -1
    ? computedPhases.value[idx].groups[0]
    : undefined
})

const createdBracket = ref<Bracket | undefined>()
const gotEmptyBracket = watch(
  () => selectedGroup.value?.bracket,
  (bracket: Bracket | undefined) => {
    if (Array.isArray(bracket) && bracket.length > 0) {
      const createdBracketValue = bracket
        .map((round: BracketRound, roundIdx: number) => {
          return round.map((matchup: BracketMatchup) => {
            
            const { roundGameIdx } = matchup
            const winnersFrom = !matchup.winnersFrom && roundIdx > 0 
                ? [roundGameIdx * 2, roundGameIdx * 2 + 1].map((idx: number) => {
                    return bracket[roundIdx - 1][idx]
                  })
                : matchup.winnersFrom || []
            
            const scores = winnersFrom
            ? winnersFrom.reduce(
                (acc: (ScoresComputed | undefined)[], mu: BracketMatchup) => {
                  const { roundIdx, roundGameIdx } = mu
                  const teamId =
                    selectedWinners.value && selectedWinners.value[roundIdx]
                      ? selectedWinners.value[roundIdx][roundGameIdx]
                      : undefined
                  acc.push(
                    teamId
                      ? ({
                          ...getTeam(teamId),
                          id: teamId,
                          winner: winnerTeamId.value === teamId || false,
                          finalScore: finalScore.value?.[teamId] || 0
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
              game : roundIdx === 0 ? matchup.game : { scores }
            } as BracketMatchup
          })
        })
      createdBracket.value = createdBracketValue
      gotEmptyBracket()
    }
  },
  { immediate: true }
)

const bracketRow = computed(() =>
  Array.isArray(rows.value)
    ? rows.value.find((row: BracketItem) => row.id === bracketId)
    : undefined
)
const title = computed<string | undefined>(() => bracketRow.value?.title)
const selectedWinners = computed<(string | undefined)[][]>(() => bracketRow.value?.winners || [])
const finalScore = computed<any | undefined>(() => bracketRow.value?.final || [])

const winnerTeamId = computed(() => {
  const final = selectedWinners.value?.slice(-1)
  return final?.[0]?.[0] as TeamId
})

</script>
<template>
  <div>
    <template v-if="!isCompetitionReady || !isBracketReady">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else-if="!computedPhases?.length">
      <p>Error: No phase.</p>
    </template>
    <template v-else-if="!bracketRow">
      <p>Error: bracket does not exist.</p>
    </template>
    <template v-else>
      <FieldComp label="Nombre del bracket">
        <h3>{{ title }}</h3>
      </FieldComp>
      <BracketView :bracket="createdBracket" :disabled="true" :selected-winners="selectedWinners" />
      <template v-if="isAdmin">
        <hr />
        <div class="row">
          <template v-for="(round, rIdx) in selectedWinners" :key="rIdx">
            <div class="col">
              <template v-for="teamId in round" :key="teamId">
                <div><TeamLogo :team-id="teamId" /></div>
              </template>
            </div>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>
