<template>
    <div>
      <div
        class="d-flex align-items-stretch rounded"
        :class="{ 'shadow-sm': isFinal} "
      >
        <div
          class="px-1 d-flex align-items-center rounded-start border border-end-0 bg-dark text-light"
          :class="{ 'bg-secondary border-secondary': matchup.game && matchup.game.scores, 'border-dark': isFinal }"
        >
          <template v-if="isFinal">
            F
          </template>
          <template v-else>
            {{ matchup.mIdx }}
          </template>
        </div>
        <div
          class="flex-grow-1 d-flex border border-start-0 rounded-end bg-light"
          :class="{ 'bg-secondary border-secondary': game && game.scores, 'border-dark py-2': isFinal }"
        >
          <div class="flex-grow-1">
            <template v-for="(team, tIdx) in teams" :key="tIdx">
              <div class="py-1 ps-1 pe-2 d-flex align-items-center">
                <template v-if="team.id">
                  <TeamLogo
                    :team-id="team.id"
                    :size="25"
                  />
                </template>
                <div class="ms-1 d-flex align-items-center">
                  <template v-if="team.id">
                    <span
                      class="team-name"
                      :class="{ 'fw-bold': team.isWinner }"
                    >
                      {{ team.title }}
                    </span>
                    <template v-if="team?.pos">
                      <small class="ps-1 text-body-secondary">{{ team?.pos }}</small>
                    </template>
                  </template>
                  <template v-else>
                    <span class="text-body-secondary">Ganador de ?</span>
                  </template>
                </div>
                <div class="ms-auto d-flex justify-content-end align-items-center ps-2"
                  :class="{ 'font-weight-bold': scores && teams.isWinner }"
                >
                  <template v-if="scores">
                    <template v-if="scores && teams.isWinner">
                      *
                    </template>
                    {{ teams.score }}
                  </template>
                </div>
              </div>
            </template>
          </div>
          <template v-if="game && !scores">
            {{ game.date }}
          </template>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs';
import type { TeamId } from '@/types/teams';
import { computed } from 'vue';

interface IProps {
  matchup: any,
  isFinal?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isFinal: false
})
const { getTeam } = useLibs()
const game = computed(() => {
  return props.matchup.row || null
})
const scores = computed(() => {
  return game.value?.score
})
const teams = computed(() => {
  return Array.isArray(game.value?.teams)
    ? game.value?.teams
      .map((teamId: TeamId) => {
        const scores: number[] = Object.values(game.value?.scores)
        return {
          ...getTeam(teamId),
          score: game.value?.scores[teamId],
          isWinner: game.value?.scores[teamId] === Math.max(...scores),
          pos: 0
        }
      })
    : [{}, {}]
})
  </script>