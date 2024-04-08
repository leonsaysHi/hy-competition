<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import GameBoxcore from '@/components/games/GameBoxcore.vue'
import GameTeamsStats from '@/components/games/GameTeamsStats.vue'
import GamePeriods from '@/components/games/GamePeriods.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import GameComputed from '@/models/GameComputed'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { Game } from '@/types/games'
import AwardsList from '@/components/competitions/AwardsList.vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
</script>
<template>
  <div>
    <template v-if="!isReady || !row?.id || !gameComputed">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="row align-items-start">
        <div
          class="col d-flex flex-column-reverse justify-content-start align-items-center gap-2"
        >
          <strong class="fs-5 jersey-team text-center lh-1">{{
            gameComputed.scores[0].title
          }}</strong>
          <TeamLogo :team-id="gameComputed.scores[0].id" :size="100" />
        </div>
        <div class="col col-auto">
          <template v-if="gameComputed.isFinished || gameComputed.isLive">
            <div class="d-flex align-items-center justify-content-center gap-2">
              <template v-for="(team, idx) in gameComputed.scores" :key="idx">
                <div
                  class="py-2 px-3 border border-5 rounded-2 display-3 d-none d-md-block"
                  :class="[
                    gameComputed.isFinished ? (team.winner ? 'border-win' : 'border-loss') : ''
                  ]"
                >
                  <strong class="jersey-score">{{ team.finalScore }}</strong>
                </div>
                <div
                  class="py-2 px-3 border border-5 rounded-2 display-6 d-md-none"
                  :class="[team.winner ? 'border-win' : 'border-loss']"
                >
                  <strong class="jersey-score">{{ team.finalScore }}</strong>
                </div>
              </template>
            </div>
          </template>
          <template v-else>
            <div class="d-flex flex-column justify-content-center align-items-center">
              {{ gameComputed.date?.long }}
              <span class="text-body-secondary">{{ gameComputed.date.time }}</span>
            </div>
          </template>
        </div>
        <div
          class="col d-flex flex-column-reverse justify-content-start align-items-center gap-2"
        >
          <strong class="jersey-team fs-5 text-center lh-1">{{
            gameComputed.scores[1].title
          }}</strong>
          <TeamLogo :team-id="gameComputed.scores[1].id" :size="100" />
        </div>
      </div>
      <template v-if="gameComputed.isLive">
        <div class="mb-3 vstack justify-content-center align-items-center">
          <span class="text-success">{{ t('global.gameDetails.live') }}</span>
          <SpinnerComp grow variant="success" size="sm" />
        </div>
      </template>
      <template v-if="gameComputed.isFinished || gameComputed.isLive">
        <div class="vstack gap-2 align-items-center">
          <GamePeriods :scores="gameComputed.scores" />
          <AwardsList :items="gameComputed.row.awards" class="d-inline-flex flex-column gap-1" />
        </div>
      </template>
      <template v-if="gameComputed.isFinished || gameComputed.isLive">
        <h3>{{ t('global.statistic', 2) }}</h3>
        <ul class="mt-5 mb-3 nav nav-tabs">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="[statView === 0 && 'active']"
              :aria-current="statView === 0 ? 'page' : false"
              href="#"
              @click="statView = 0"
              >{{ t('global.team', 2) }}</a
            >
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="[statView === 1 && 'active']"
              :aria-current="statView === 1 ? 'page' : false"
              href="#"
              @click="statView = 1"
              >{{ t('global.player', 2) }}</a
            >
          </li>
        </ul>
        <template v-if="statView === 0">
          <GameTeamsStats :boxscore="gameComputed.boxScore" :teams="competitionTeams" />
        </template>
        <template v-if="statView === 1">
          <GameBoxcore :boxscore="gameComputed.boxScore" :teams="competitionTeams" />
        </template>
      </template>
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
