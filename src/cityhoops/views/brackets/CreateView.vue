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
import ModalComp from '@/components/ModalComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import InputComp from '@/components/InputComp.vue'
import { add } from '@/utils/maths'
import FieldComp from '@/components/FieldComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import useBracketsLib from '@/cityhoops/composable/useBracketsLib'
import { useRouter } from 'vue-router'

export type BracketSelection = (TeamId | undefined)[][]
export type BracketFinalScore = { [key: TeamId]: number }

const { writeRows } = useBracketsLib()

const router = useRouter()
const competitionId = 'YNZaQiwQDMPHCWsE1KrQ'

const { isReady, computedPhases } = useCompetition(competitionId)
const { getTeam, getTeamName } = useLibs()
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
const isReadOnly = ref<boolean>(false)
const title = ref<string | number>('')
const selectedWinners = ref<BracketSelection | undefined>([])
const finalScore = ref<BracketFinalScore | undefined>()

const dataErrors = computed<string[]>(() => {
  const result = []
  if (!isFinalScoreInputValid.value) {
    result.push('Por favor llenar el bracket completo.')
  }
  return result
})

const finalScoreInput = ref<BracketFinalScore | undefined>()
const finalScoreModal = ref<typeof ModalComp>()

const winnerTeamId = computed(() => {
  const final = selectedWinners.value?.slice(-1)
  return final?.[0]?.[0] as TeamId
})
const isFinalScoreInputValid = computed(() => {
  const scores = finalScoreInput.value ? Object.values(finalScoreInput.value) : []
  const totalPoints = scores.reduce(add, 0)
  return (
    totalPoints > 0 &&
    scores[0] !== scores[1] &&
    finalScoreInput.value?.[winnerTeamId.value] === Math.max(...scores)
  )
})
const createdBracket = computed<Bracket>((): Bracket => {
  return emptyBracket.value
    ? emptyBracket.value.map((round: BracketRound, roundIdx: number) => {
        return round.map((matchup: BracketMatchup) => {
          const scores = matchup.winnersFrom
            ? matchup.winnersFrom.reduce(
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
            game: roundIdx > 0 ? { scores } : matchup.game
          }
        })
      })
    : ([] as Bracket)
})

const handleSelectWinner = (matchup: BracketMatchup, teamId: TeamId) => {
  const { roundIdx, roundGameIdx } = matchup
  const result: BracketSelection = [
    ...(Array.isArray(selectedWinners.value) ? selectedWinners.value : [])
  ]
  result[roundIdx] = [...(Array.isArray(result[roundIdx]) ? result[roundIdx] : [])]

  const prevTeamId = result[roundIdx][roundGameIdx]
  if (prevTeamId) {
    result.forEach((round: (TeamId | undefined)[], rIdx: number) => {
      if (rIdx > roundIdx && round) {
        round.forEach((teamId: TeamId | undefined, idx: number) => {
          if (teamId === prevTeamId) {
            round.splice(idx, 1, undefined)
            finalScoreInput.value = undefined
            finalScore.value = undefined
          }
        })
      }
    })
  }
  result[roundIdx][roundGameIdx] = teamId
  //
  selectedWinners.value = result
  if (matchup.isFinal) {
    finalScoreInput.value = selectedWinners.value[selectedWinners.value.length - 2].reduce(
      (result: BracketFinalScore, teamId: TeamId) => {
        result[teamId] = 0
        return result
      },
      {}
    )
    finalScoreModal.value?.show()
  }
}
const handleSubmitFinalScoreInput = () => {
  finalScore.value = finalScoreInput.value
  finalScoreModal.value?.hide()
}

const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
  isReadOnly.value = true
  const resp = await writeRows([
    {
      title: title.value,
      competitionId,
      winners: selectedWinners.value,
      final: finalScore.value
    }
  ])
  const id = resp[0].id
  router.push({ name: 'bracket-view', params: { bracketId: id } })
}
</script>
<template>
  <div class="pb-5 mb-5">
    <template v-if="!isReady">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else-if="!computedPhases?.length">
      <p>Error: No phase.</p>
    </template>
    <template v-else>
      <form @submit="handleSubmit">
        <FieldComp label="Nombre del bracket" helper="Debe tener al menos 5 caracteres.">
          <InputComp v-model="title" :minlength="5" :disabled="isReadOnly" required />
        </FieldComp>
        <FieldComp label="Bracket">
          <BracketView
            :bracket="createdBracket"
            :disabled="isReadOnly"
            :selected-winners="selectedWinners"
            @select-winner="handleSelectWinner"
          />
        </FieldComp>
        <div class="hstack justify-content-center">
          <ButtonComp
            type="submit"
            size="lg"
            :isBusy="isReadOnly"
            :variant="isReadOnly ? 'light' : 'primary'"
            :disabled="isReadOnly || dataErrors.length > 0"
            >Guardar el bracket</ButtonComp
          >
        </div>
      </form>
      <ModalComp
        ref="finalScoreModal"
        hide-cancel
        :ok-variant="!isFinalScoreInputValid ? 'light' : 'primary'"
        :ok-disabled="!isFinalScoreInputValid"
        @ok="handleSubmitFinalScoreInput"
      >
        <template v-if="finalScoreInput">
          <div class="hstack gap-3">
            <template v-for="(score, teamId) in finalScoreInput" :key="teamId">
              <div class="vstack align-items-center gap-2">
                <TeamLogo :team-id="teamId" :size="50" />
                <h4 class="font-team text-center">{{ getTeamName(teamId) }}</h4>
                <InputComp
                  v-model="finalScoreInput[teamId]"
                  type="number"
                  size="lg"
                  class="border border-3"
                  :class="winnerTeamId === teamId ? 'border-win' : 'border-loss'"
                />
              </div>
            </template>
          </div>
        </template>
      </ModalComp>
    </template>
  </div>
</template>
