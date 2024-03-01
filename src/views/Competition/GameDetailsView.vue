<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import GameBoxcore from '@/components/games/GameBoxcore.vue'
import GameLeaders from '@/components/games/GameLeaders.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import GameComputed from '@/models/GameComputed'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { Game, PlayerBoxScore, GameBoxScore } from '@/types/games'
import type { CompetitionPlayer } from '@/types/players'

const route = useRoute()
const { competitionId, gameId } = route.params as { competitionId: string; gameId: string }

const { isReady, row: competition, getCompetitionTeam } = useCompetition(competitionId)

const row = computed<Game | undefined>(() =>
  competition.value?.games?.find((game) => game.id === gameId)
)
const gameComputed = computed<GameComputed | undefined>(() =>
  row.value?.id ? new GameComputed(competitionId, row.value) : undefined
)

const statView = ref<number>(0)
const competitionTeams = computed<CompetitionTeam[]>(() => {
  return row.value?.teams.map((teamId: TeamId): CompetitionTeam => {
    return getCompetitionTeam(teamId)
  }) as CompetitionTeam[]
})
const teamsBoxscores = computed<GameBoxScore[]>(() => {
  return Array.isArray(row.value?.teams)
    ? row.value.teams.map((teamId: TeamId) => {
        const players: CompetitionPlayer[] = getCompetitionTeam(teamId).players
        return players.reduce((boxscore: GameBoxScore, player: CompetitionPlayer) => {
          return {
            ...boxscore,
            [player.id]: gameComputed.value?.boxScore[player.id] as PlayerBoxScore
          }
        }, {} as GameBoxScore)
      })
    : []
})
</script>
<template>
  <div>
    <template v-if="!isReady || !row?.id || !gameComputed">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="d-flex gap-2">
        <div
          class="flex-grow-1 d-flex flex-column-reverse justify-content-start align-items-center gap-2"
        >
          <strong class="fs-3 jersey-team">{{ gameComputed.scores[0].title }}</strong>
          <TeamLogo :team-id="gameComputed.scores[0].id" :size="100" class="d-none d-md-block" />
          <TeamLogo :team-id="gameComputed.scores[0].id" :size="60" class="d-md-none" />
        </div>
        <div class="d-flex align-items-center justify-content-center gap-2">
          <template v-if="gameComputed.isFinished">
            <template v-for="(team, idx) in gameComputed.scores" :key="idx">
              <div
                class="p-2 border border-5 rounded-2 display-3 d-none d-md-block"
                :class="[team.winner ? 'border-win' : 'border-loss']"
              >
                <strong class="jersey-score">{{ team.finalScore }}</strong>
              </div>
              <div
                class="p-2 border border-5 rounded-2 display-6 d-md-none"
                :class="[team.winner ? 'border-win' : 'border-loss']"
              >
                <strong class="jersey-score">{{ team.finalScore }}</strong>
              </div>
            </template>
          </template>
          <template v-else>
            <div class="d-flex flex-column justify-content-center align-items-center">
              {{ gameComputed.date?.long }}
              <span class="text-body-secondary">{{ gameComputed.date.time }}</span>
            </div>
          </template>
        </div>
        <div
          class="flex-grow-1 d-flex flex-column-reverse justify-content-start align-items-center gap-2"
        >
          <strong class="jersey-team fs-3">{{ gameComputed.scores[1].title }}</strong>
          <TeamLogo :team-id="gameComputed.scores[1].id" :size="100" class="d-none d-md-block" />
          <TeamLogo :team-id="gameComputed.scores[1].id" :size="60" class="d-md-none" />
        </div>
      </div>
      <template v-if="gameComputed.isFinished">
        <ul class="mt-5 mb-3 nav nav-tabs">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="[statView === 0 && 'active']"
              :aria-current="statView === 0 ? 'page' : false"
              href="#"
              @click="statView = 0"
              >Game leaders</a
            >
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="[statView === 1 && 'active']"
              :aria-current="statView === 1 ? 'page' : false"
              href="#"
              @click="statView = 1"
              >Boxscore</a
            >
          </li>
        </ul>
        <template v-if="statView === 0">
          <div class="row gap-2">
            <template v-for="(boxscore, idx) in teamsBoxscores" :key="idx">
              <div class="col">
                <GameLeaders :boxscore="boxscore" />
              </div>
              <template v-if="idx === 0"
                ><div class="col col-auto px-0 border-start"></div
              ></template>
            </template>
          </div>
        </template>
        <template v-if="statView === 1">
          <GameBoxcore :boxscore="row.boxscore" :teams="competitionTeams" />
        </template>
      </template>
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
