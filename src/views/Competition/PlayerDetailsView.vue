<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import StatsTableComp from '@/components/StatsTableComp.vue'
import type { CompetitionTeam } from '@/types/teams'
import type { CompetitionPlayer } from '@/types/players'
import useLibs from '@/composable/useLibs'

import TeamLogo from '@/components/teams/TeamLogo.vue'
import ImageComp from '@/components/ImageComp.vue'
import useCompetition from '@/composable/useCompetition'
import PlayerGamesList from '@/components/games/PlayerGamesList.vue'
import type { Game } from '@/types/games'
import type { Option } from '@/types/comp-fields'
import useOptionsLib from '@/composable/useOptionsLib'
import type { TableField, TableItem } from '@/types/comp-table'
import type { CompetitionRanking } from '@/types/computed'
import type { PlayerStatKey } from '@/types/stats'

import { useI18n } from 'vue-i18n'
import GameComputedClass from '@/models/GameComputed'
const { t } = useI18n()
const route = useRoute()
const { competitionId, playerId } = route.params as { competitionId: string; playerId: string }

const { getPlayerName } = useLibs()
const { playerRankingKeys } = useOptionsLib()
const {
  isReady: isCompetitionReady,
  getCompetitionPlayer,
  getPlayerCompetitionTeam,
  games,
  competitionRankings
} = useCompetition(competitionId)

const competitionTeam = computed<CompetitionTeam | undefined>(() =>
  getPlayerCompetitionTeam(playerId)
)
const competitionPlayer = computed<CompetitionPlayer | undefined>(() =>
  getCompetitionPlayer(playerId)
)
const playerGames = computed<GameComputedClass[]>(() => {
  return Array.isArray(games.value) && competitionTeam.value?.id
    ? games.value
        .filter((game: Game) => {
          return (
            game.isFinished &&
            Object.keys(game.boxscore).includes(playerId) &&
            !game.boxscore[playerId].dnp
          )
        })
        .map((game: Game) => new GameComputedClass(competitionId, game))
    : []
})

const statsFields = computed<TableField[]>(() => {
  const fields = playerRankingKeys.reduce(
    (fields: TableField[], opt): TableField[] => [
      ...fields,
      {
        key: opt.value,
        label: opt.text,
        sortable: true,
        thClass: 'text-end',
        tdClass: 'text-end'
      }
    ],
    []
  )
  const minIdx = fields.findIndex((field) => field.key === 'time')
  fields.splice(
    minIdx + 1,
    0,
    {
      key: 'pts',
      label: t('options.playerStats.text.pts'),
      sortable: true,
      thClass: 'text-end',
      tdClass: 'text-end'
    },
    {
      key: 'pir',
      label: t('options.playerStats.text.pir'),
      sortable: true,
      thClass: 'text-end',
      tdClass: 'text-end'
    }
  )
  return fields
})

const statsItem = computed<TableItem[]>(() => {
  const rank = competitionRankings.value?.find(
    (rank: CompetitionRanking) => rank.playerId === playerId
  )
  return rank
    ? [
        {
          ...rank,
          ...playerRankingKeys.reduce((result: TableItem, opt: Option) => {
            const key = opt.value as PlayerStatKey
            result[key] = rank[key]
            return result
          }, {})
        }
      ]
    : []
})
</script>
<template>
  <div>
    <template v-if="!isCompetitionReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="mt-4 pb-3 d-flex gap-3">
        <div>
          <TeamLogo :team-id="competitionTeam?.id" :size="150" />
        </div>
        <div>
          <div class="display-1 text-body-secondary lh-1 jersey-number">
            #<strong>{{ competitionPlayer?.number }}</strong>
          </div>
          <h1 class="display-6 fw-bold jersey-name">{{ getPlayerName(playerId) }}</h1>
        </div>
        <div class="ms-auto align-self-end">
          <div class="d-flex flex-column align-items-center gap-2">
            <ImageComp :src="competitionTeam?.sponsor" :width="100" />
          </div>
        </div>
      </div>
      <StatsTableComp :fields="statsFields" :items="statsItem"></StatsTableComp>
      <hr />
      <h3>{{ t('global.game', 2) }}</h3>
      <PlayerGamesList :items="playerGames" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
