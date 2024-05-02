<template>
  <div>
    <div class="d-flex align-items-stretch rounded" :class="{ 'shadow-sm': isFinal }">
      <div
        class="px-1 d-flex align-items-center rounded-start border border-end-0 border-black bg-black text-light"
        :class="{
          'bg-secondary border-secondary': matchup.game?.isFinished,
          'border-black': isFinal
        }"
      >
        <template v-if="isFinal">
          <i class="bi bi-trophy-fill"></i>
        </template>
        <template v-else>
          {{ matchup.matchupId }}
        </template>
      </div>
      <div
        class="flex-grow-1 d-flex border border-start-0 rounded-end bg-light"
        :class="{
          'bg-secondary border-secondary': matchup.game?.isFinished,
          'border-black py-2': isFinal
        }"
      >
        <div class="flex-grow-1">
          <template v-for="(team, tIdx) in matchupTeams" :key="team?.id || tIdx">
            <div class="py-1 px-2 hstack gap-1 align-items-center">
              <template v-if="team?.id">
                <TeamLogo :team-id="team.id" :size="25" />
                <div class="ms-1 d-flex align-items-center">
                  <span
                    class="font-team"
                    :class="{
                      'fw-bold':
                        team.winner ||
                        selectedWinners?.[matchup.roundIdx]?.[matchup.roundGameIdx] === team?.id
                    }"
                  >
                    {{ team.title }}
                  </span>
                </div>
              </template>
              <template v-else>
                <span class="text-body-secondary">{{
                  t('bracket.winnerFrom', { n: team?.winnerFrom })
                }}</span>
              </template>
              <div class="ms-auto hstack">
                <template v-if="team?.id && selectedWinners">
                  <div class="d-flex justify-content-end align-items-start">
                    <ButtonComp
                      :variant="
                        selectedWinners[matchup.roundIdx]?.[matchup.roundGameIdx]
                          ? 'light'
                          : 'primary'
                      "
                      :class="[
                        selectedWinners[matchup.roundIdx]?.[matchup.roundGameIdx] ||
                          (selectedWinners[matchup.roundIdx]?.[matchup.roundGameIdx] === team?.id &&
                            'border')
                      ]"
                      size="sm"
                      :disabled="
                        disabled ||
                        !hasTeams ||
                        selectedWinners[matchup.roundIdx]?.[matchup.roundGameIdx] === team?.id
                      "
                      @click="() => handleSelect(team?.id)"
                    >
                      <template v-if="!isFinal">
                        <template
                          v-if="
                            !selectedWinners[matchup.roundIdx]?.[matchup.roundGameIdx] ||
                            selectedWinners[matchup.roundIdx]?.[matchup.roundGameIdx] === team?.id
                          "
                        >
                          <i class="bi bi-star-fill"></i
                        ></template>
                        <template v-else> <i class="bi bi-star"></i></template>
                      </template>
                      <template v-else>
                        <template
                          v-if="
                            !selectedWinners[matchup.roundIdx]?.[matchup.roundGameIdx] ||
                            selectedWinners[matchup.roundIdx]?.[matchup.roundGameIdx] === team?.id
                          "
                        >
                          <i class="bi bi-trophy-fill"></i
                        ></template>
                        <template v-else> <i class="bi bi-trophy"></i></template>
                      </template>
                    </ButtonComp>
                  </div>
                </template>
                <template v-if="team && (matchup.game?.isFinished || (isFinal && hasScore))">
                  <div
                    class="d-flex justify-content-end align-items-center px-1 rounded-1 border border-3"
                    :class="[team.winner ? 'border-win' : 'border-loss', team?.winner && 'fw-bold']"
                  >
                    {{ team.finalScore }}
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>

        <template v-if="!selectedWinners && matchup.game?.date && !matchup.game.isFinished">
          <div class="d-flex align-items-center p-2 small">
            {{ matchup.game.date.short }}
            <br />
            {{ matchup.game.date.time }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs'
import type { ScoresComputed } from '@/models/GameComputed'
import type { BracketMatchup } from '@/types/competitions'
import type { Team, TeamId } from '@/types/teams'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ButtonComp from '../ButtonComp.vue'
import type { BracketSelection } from '@/cityhoops/views/brackets/CreateView.vue'

interface IProps {
  matchup: BracketMatchup
  disabled?: boolean
  isFinal?: boolean
  selectedWinners?: BracketSelection
}
const props = withDefaults(defineProps<IProps>(), {
  disabled: false,
  isFinal: false,
  selectedWinners: undefined
})

const { t } = useI18n()
const { getTeam } = useLibs()
const emit = defineEmits(['select-winner', 'final-score'])

interface MatchupTeam extends ScoresComputed, Team {
  winnerFrom: number
}
const matchupTeams = computed<(MatchupTeam | undefined)[]>(() => {
  const scores = props.matchup.game?.scores
    ? props.matchup.game.scores.map((row: ScoresComputed | undefined) => {
        return row
          ? {
              ...getTeam(row.id),
              ...row
            }
          : undefined
      })
    : []
  const winnersFrom = Array.isArray(props.matchup.winnersFrom)
    ? props.matchup.winnersFrom.map((matchup: BracketMatchup) => {
        const scores: ScoresComputed[] = matchup.game.scores
        const winner = scores?.find((row: ScoresComputed) => row.winner)
        return {
          winnerFrom: matchup.matchupId,
          ...(winner ? getTeam(winner.id) : {})
        }
      })
    : []

  return [scores[0] || winnersFrom[0] || undefined, scores[1] || winnersFrom[1] || undefined]
})

const hasTeams = computed(() => {
  return matchupTeams.value?.every((team: MatchupTeam | undefined) => team?.id)
})
const hasScore = computed(() => {
  return (
    props.matchup?.game?.scores &&
    Object.values(props.matchup.game.scores).some((score: ScoresComputed) =>
      score ? score.finalScore > 0 : false
    )
  )
})

const handleSelect = (teamId: TeamId) => {
  emit('select-winner', teamId)
}
</script>
