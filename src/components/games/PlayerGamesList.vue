<script lang="ts" setup>
import TeamLogo from '@/components/teams/TeamLogo.vue'
import GameComputedClass, { type ScoresComputed } from '@/models/GameComputed'
import type { Game } from '@/types/games'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TableComp from '../TableComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import type { TableField, TableItem } from '@/types/comp-table'
import useLibs from '@/composable/useLibs'
import useCompetitionComputed from '@/composable/useCompetitionComputed'
import type { PlayerBoxScore } from '@/types/stats'
import type { CompetitionTeam, TeamId } from '@/types/teams'

interface PlayerGameComputed extends PlayerBoxScore {
  datetime: string
  isFinished: boolean
  isWin: boolean
  oppId: TeamId
}

const route = useRoute()
const { competitionId, playerId } = route.params

interface IProps {
  items: Game[]
}
const props = withDefaults(defineProps<IProps>(), {})

const { getTeamName, getCompetition } = useLibs()
const { statsKeys } = useOptionsLib()
const { getPlayerCompetitionTeam } = useCompetitionComputed(competitionId)

const row = getCompetition(competitionId)
const fields = computed(() => [
  { key: 'datetime', label: 'Date' },
  { key: 'opp', label: 'Opp' },
  { key: 'isWin', label: '', tdClass: 'text-center' },
  ...statsKeys.reduce((fields: TableField[], opt): TableField[] => {
    if (row?.trackedStats.includes(opt.value)) {
      return [
        ...fields,
        {
          key: opt.value,
          label: opt.text,
          thClass: 'text-end',
          tdClass: 'text-end'
        }
      ]
    }
    return fields
  }, [])
])
const computedGames = computed<TableItem[]>(() => {
  return props.items.map((game: Game) => {
    const computedGame = new GameComputedClass(competitionId, game)
    const team = getPlayerCompetitionTeam(playerId) as CompetitionTeam
    const opp = computedGame.scores.find((score: ScoresComputed) => score.id !== team?.id)
    const result: PlayerGameComputed = {
      datetime: game.datetime,
      isFinished: game.isFinished,
      isWin: !opp?.winner,
      opp: opp?.id,
      ...game.boxscore[playerId]
    }
    return result as TableItem
  })
})
</script>

<template>
  <TableComp :fields="fields" :items="computedGames">
    <template #isWin="{ value }">
      <span :class="value ? 'text-win' : 'text-loss'">{{ value ? 'W' : 'L' }}</span>
    </template>
    <template #opp="{ value }">
      <div class="d-flex gap-3">
        <strong>{{ getTeamName(value) }}</strong>
        <TeamLogo :team-id="value" :size="25" />
      </div>
    </template>
  </TableComp>
</template>

<style lang="scss" scoped>
.game {
  display: flex;
  gap: 1rem;
  .team {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    .name {
      flex-grow: 1;
      display: flex;
      align-items: center;
      justify-content: end;
      gap: 1rem;
    }
    .score {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 45px;
      height: 50px;
    }
  }
  .team ~ .team {
    flex-direction: row-reverse;
    .name {
      flex-direction: row-reverse;
      justify-content: start;
    }
  }
}
</style>
