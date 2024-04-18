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
  <div class="game-details">
    <template v-if="!isReady || !row?.id || !gameComputed">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="result" :class="{ '-is-finished': gameComputed.isFinished, '-is-live': gameComputed.isLive }">
        
        <div class="g-details">
          <template v-if="!gameComputed.isLive">
            {{ gameComputed.date?.long }}
            <span class="text-body-secondary">{{ gameComputed.date.time }}</span>
          </template>
          <template v-else>
            <span class="text-success">{{ t('global.gameDetails.live') }}</span>
            <SpinnerComp grow variant="success" size="sm" />
          </template>
        </div>

        <template v-for="(score, idx) in gameComputed.scores" :key="score.id">
          <div :class="`t${idx}-name`">
            <strong class="fs-5 jersey-team text-center lh-1">{{
              score.title
            }}</strong>
          </div>
          <div :class="`t${idx}-logo`">
            <TeamLogo class="d-none d-lg-block" :team-id="gameComputed.scores[0].id" :size="100" />
            <TeamLogo class="d-lg-none" :team-id="gameComputed.scores[0].id" :size="60" />
          </div>
          <div :class="`t${idx}-score`">
            <div
              class="py-2 px-3 rounded-2 display-6"
              :class="[score.winner ? 'bg-success-subtle' : 'bg-danger-subtle']"
            >
              <strong class="jersey-score">{{ score.finalScore }}</strong>
            </div>
          </div>
        </template>
        
      </div>
      
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
