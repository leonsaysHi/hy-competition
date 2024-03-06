<script lang="ts" setup>
import useLibs from '@/composable/useLibs'
import type { Option } from '@/types/comp-fields'
import { computed } from 'vue'
import type { PlayerStatKey } from '@/types/stats'
import type { GameBoxScore, PlayerBoxScore } from '@/types/games'
import type { CompetitionPlayer, PlayerId } from '@/types/players'
import { useRoute } from 'vue-router'
import useOptionsLib from '@/composable/useOptionsLib'
import useCompetition from '@/composable/useCompetition'

const route = useRoute()
const { competitionId } = route.params
const { row: competition, getCompetitionPlayer } = useCompetition(competitionId)
const { playerStatsKeys } = useOptionsLib()
const { getPlayerName } = useLibs()

const competitionStatsKeys = computed<PlayerStatKey[]>(() => {
  return playerStatsKeys
    .filter((opt: Option) => competition.value?.trackedStats.includes(opt.value))
    .map((opt: Option) => opt.value as PlayerStatKey)
})

interface IProps {
  boxscore: GameBoxScore
}

const props = withDefaults(defineProps<IProps>(), {})

interface PlayerBoxScoreItem extends CompetitionPlayer, PlayerBoxScore {
  id: PlayerId
}
type StatLeaders = { [key in PlayerStatKey]: PlayerBoxScoreItem[] }

const leadersBystats = computed<StatLeaders>(() => {
  const boxScorelist: PlayerBoxScoreItem[] = Object.keys(props.boxscore)
    .map(
      (playerId: PlayerId) =>
        ({
          ...getCompetitionPlayer(playerId),
          ...props.boxscore[playerId]
        }) as PlayerBoxScoreItem
    )
    .filter((bs: PlayerBoxScoreItem) => !bs.dnp)
  return competitionStatsKeys.value.reduce((statsLeader: StatLeaders, key: PlayerStatKey) => {
    const bs = boxScorelist.slice()
    bs.sort((a, b) => {
      const aKey = a[key]
      const bKey = b[key]
      return bKey - aKey
    })
    const leader: PlayerBoxScoreItem = bs[0]
    return {
      ...statsLeader,
      [key]: [leader]
    }
  }, {} as StatLeaders)
})
const getStatShort = (key: PlayerStatKey): string =>
  playerStatsKeys.find((opt: Option) => opt.value === key)?.text as string
</script>
<template>
  <div class="row row-cols-1 row-cols-md-2 g-2">
    <template v-for="(items, key) in leadersBystats" :key="key">
      <div class="col">
        <div class="card card-sm">
          <div class="card-body d-flex">
            <div class="vstack gap-1">
              <div class="fs-4 lh-1 text-body-secondary jersey-name">#{{ items[0].number }}</div>
              <div class="fs-4 lh-1 jersey-name">{{ getPlayerName(items[0].id) }}</div>
            </div>
            <div class="d-flex align-items-start gap-1">
              <div class="display-3 jersey-number lh-1">{{ items[0][key] }}</div>
              <strong class="small">{{ getStatShort(key) }}</strong>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
