<template>
    <div>
      <div
        class="d-flex align-items-stretch rounded"
        :class="{ 'shadow-sm': isFinal} "
      >
        <div
          class="px-1 d-flex align-items-center rounded-start border border-end-0 border-black bg-black text-light"
          :class="{ 'bg-secondary border-secondary': matchup.game && matchup.game.scores, 'border-black': isFinal }"
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
          :class="{ 'bg-secondary border-secondary': game && game.scores, 'border-black py-2': isFinal }"
        >
          <div class="flex-grow-1">
            <template v-if="teams">
            <template v-for="(team, tIdx) in teams" :key="tIdx">
              <div class="p-1 pe-2 d-flex align-items-center">
                <TeamLogo
                  :team-id="team.id"
                  :size="25"
                />
                <div class="ms-1 d-flex align-items-center">
                  <span
                    class="team-name"
                    :class="{ 'fw-bold': team.winner }"
                  >
                    {{ team.title }}
                  </span>
                  <template v-if="team?.pos">
                    <small class="ps-1 text-body-secondary">{{ team?.pos }}</small>
                  </template>
                </div>
                <template v-if="game.isFinished">
                  <div class="ms-auto d-flex justify-content-end align-items-center px-2 rounded-1"
                    :class="[team.winner ? 'bg-win' : 'bg-loss', scores && team?.winner && 'fw-bold']"
                  >
                      {{ team?.score }}
                  </div>
                </template>
              </div>
            </template>
          </template>
        <template v-if="winnersFrom">
          <template v-for="winnerFrom in winnersFrom" :key="winnerFrom">
            <div class="py-1 px-2 d-flex align-items-center">
              <span class="text-body-secondary">{{ t('bracket.winnerFrom', { n: winnerFrom }) }}</span>
            </div>
          </template>
        </template>
          </div>
          <template v-if="game && !scores">
            {{ game.datetime }}
          </template>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs';
import type { BracketMatchup } from '@/types/competitions';
import type { Game } from '@/types/games';
import type { TeamId } from '@/types/teams';
import { add } from '@/utils/maths';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n'

interface IProps {
  matchup: BracketMatchup,
  isFinal?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isFinal: false
})

const { t } = useI18n()
const { getTeam } = useLibs()

const game = computed<Game>(() => {
  return props.matchup.row as Game || undefined
})

const scores = computed(() => {
  return game.value?.scores
})
const winnersFrom = computed(() => {
  return  props.matchup.winnersFrom.every(Boolean)
    ? props.matchup.winnersFrom
    : undefined
})
const teams = computed(() => {
  return Array.isArray(game.value?.teams)
    ? game.value?.teams
      .map((teamId: TeamId) => {
        const scores: number[] = Object.values(game.value?.scores).map((arr: number[]) => arr.reduce(add, 0))
        const teamScore = game.value?.scores[teamId].reduce(add, 0)
        return {
          ...getTeam(teamId),
          score: teamScore,
          winner: game.value.isFinished && teamScore === Math.max(...scores),
          pos: 0
        }
      })
    : undefined
})
  </script>