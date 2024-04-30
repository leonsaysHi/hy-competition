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
          {{ matchup.matchupIdx }}
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
          <template v-for="(team, tIdx) in matchupTeams" :key="tIdx">
            <div class="py-1 px-2 hstack gap-1 align-items-center">
              <template v-if="team?.id">
                <TeamLogo :team-id="team.id" :size="25" />
                <div class="ms-1 d-flex align-items-center">
                  <span class="font-team" :class="{ 'fw-bold': team.winner }">
                    {{ team.title }}
                  </span>
                </div>
              </template>
              <template v-else>
                <span class="text-body-secondary">{{
                  t('bracket.winnerFrom', { n: team?.winnerFrom })
                }}</span>
              </template>
              <template v-if="team && matchup.game?.isFinished">
                <div
                  class="ms-auto d-flex justify-content-end align-items-center px-1 rounded-1 border border-2"
                  :class="[team.winner ? 'border-win' : 'border-loss', team?.winner && 'fw-bold']"
                >
                  {{ team.finalScore }}
                </div>
              </template>
            </div>
          </template>
        </div>
        <template v-if="matchup.game?.date && !matchup.game.isFinished">
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
import type { Team } from '@/types/teams'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface IProps {
  matchup: BracketMatchup
  isFinal?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isFinal: false
})

const { t } = useI18n()
const { getTeam } = useLibs()

interface MatchupTeam extends ScoresComputed, Team {
  winnerFrom: number
}
const matchupTeams = computed<(MatchupTeam | undefined)[]>(() => {
  return props.matchup.game?.scores
    ? props.matchup.game.scores
        .map((row: ScoresComputed) => {
          return {
            ...getTeam(row.id),
            ...row
          }
        })
    : props.matchup.winnersFrom 
      ? props.matchup.winnersFrom 
        .map((matchup: BracketMatchup) => {
            const scores: ScoresComputed[] = matchup.game.scores
            const winner = scores?.find((row: ScoresComputed) => row.winner)
          return {
            winnerFrom: matchup.matchupIdx,
            ...(winner ? getTeam(winner.id) : {})
          }
        })
      : undefined
})
</script>
