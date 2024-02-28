<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer } from '@/types/players'
import useLibs from '@/composable/useLibs'

import TeamLogo from '@/components/teams/TeamLogo.vue'
import ImageComp from '@/components/ImageComp.vue'
import useCompetitionComputed from '@/composable/useCompetitionComputed'
import PlayerGamesList from '@/components/games/PlayerGamesList.vue'
import type { Game } from '@/types/games'
import type GameComputed from '@/models/GameComputed'
const route = useRoute()
const { competitionId, playerId } = route.params

const { getPlayerName, getTeamName } = useLibs()
const { isReady: isCompetitionReady, row: competition } = useCompetition(competitionId)
const { isReady: isComputedCompetitionReady, games } = useCompetitionComputed(competitionId)

const competitionTeam = computed<CompetitionTeam | undefined>(
  () =>
    competition.value?.teams?.find((team: CompetitionTeam) =>
      team.players.findIndex((player: CompetitionPlayer) => player.id === playerId)
    ) as CompetitionTeam
)
const teamId = computed<TeamId | undefined>(() => competitionTeam.value?.id)
const competitionPlayer = computed(() =>
  competitionTeam.value?.players.find((player: CompetitionPlayer) => player.id === playerId)
)
const playerGames = computed<GameComputed[]>(() => {
  return Array.isArray(games.value) && teamId.value
    ? games.value.filter((game: Game) => {
        return Object.keys(game.boxscore).includes(playerId)
      })
    : []
})
</script>
<template>
  <div>
    <template v-if="!isCompetitionReady || !isComputedCompetitionReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="mt-4 pb-3 d-flex justify-content-between gap-3">
        <div>
          <div class="display-1 text-body-secondary">
            #<strong>{{ competitionPlayer?.number }}</strong>
          </div>
          <h1 class="display-6 fw-bold">{{ getPlayerName(playerId) }}</h1>
          <h5>{{ getTeamName(competitionTeam?.id) }}</h5>
        </div>
        <div>
          <div class="d-flex flex-column align-items-center gap-2">
            <TeamLogo :team-id="competitionTeam?.id" :size="150" />
            <ImageComp :src="competitionTeam?.sponsor" :width="100" />
          </div>
        </div>
      </div>
      <PlayerGamesList :items="playerGames" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
