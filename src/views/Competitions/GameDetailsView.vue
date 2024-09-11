<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import GameBoxscore from '@/components/games/GameBoxscore.vue'
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
      <div
        class="mb-3 result"
        :class="{ '-is-finished': gameComputed.isFinished, '-is-live': gameComputed.isLive }"
      >
        <div class="g details text-center">
          {{ gameComputed.date?.long }}
          <br /><span class="text-body-secondary">{{ gameComputed.date.time }}</span>
        </div>
        <template v-for="(item, idx) in gameComputed.scores" :key="item.id">
          <div :class="`t${idx} name`">
            <strong class="fs-5 font-team text-center lh-1">{{ item.title }}</strong>
          </div>
          <div :class="`t${idx} logo`">
            <TeamLogo class="d-none d-lg-block" :team-id="item.id" :size="100" />
            <TeamLogo class="d-lg-none" :team-id="item.id" :size="60" />
          </div>
          <template v-if="gameComputed.isLive || gameComputed.isFinished">
            <div
              :class="[
                `t${idx} score pt-2 pb-1 px-3 rounded-2`,
                item.winner ? 'bg-success-subtle' : 'bg-danger-subtle'
              ]"
            >
              <strong class="display-1 font-score">{{ item.finalScore }}</strong>
            </div>
          </template>
        </template>
        <template v-if="gameComputed.isLive">
          <div class="g live d-flex align-items-center gap-2">
            <span class="text-success">{{ t('global.gameDetails.live') }}</span>
            <SpinnerComp grow variant="success" size="xs" />
          </div>
        </template>
      </div>

      <template v-if="gameComputed.isFinished || gameComputed.isLive">
        <div class="mb-3 vstack gap-2 align-items-center">
          <template v-if="gameComputed.scores[0].periods.length > 1">
            <GamePeriods :scores="gameComputed.scores" />
          </template>
          <AwardsList :items="gameComputed.row.awards" class="d-inline-flex flex-column gap-1" />
        </div>
      </template>
      <template v-if="gameComputed.isFinished || gameComputed.isLive">
        <ul class="mt-4 mb-3 nav nav-tabs">
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
          <GameBoxscore :boxscore="gameComputed.row.boxscore" :teams="competitionTeams" />
        </template>
      </template>
    </template>
  </div>
</template>
