<script lang="ts" setup>
import { computed, ref } from 'vue'
import CheckComp from '@/components/CheckComp.vue'
import StatsTableComp from '@/components/StatsTableComp.vue'

import type { CompetitionPlayerStats } from '@/types/computed'
import type { TableField } from '@/types/comp-table'
import type { Option } from '@/types/comp-fields'

import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import type { TeamId } from '@/types/team'
import useStats from '@/composable/useStats'
import type GameComputedClass from '@/models/GameComputed'

const { t } = useI18n()



interface IProps {
  games: GameComputedClass[]
  limit?: number
  teamId?: TeamId
  showAvg?: boolean
  showAvgUi?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  limit: 0,
  showAvg: true,
  showAvgUi: true
})

const route = useRoute()
const { competitionId } = route.params as { competitionId: string; playerId: string }
const { getPlayersStatsForGames } = useStats()
const { teams, trackedPlayerRankingKeys } = useCompetition(competitionId)

const _showAvg = ref<boolean>(props.showAvg)


const fields = computed(() => [
    {
      label: t('options.rankingStats.text.pos'),
      key: 'pos',
      thClass: 'text-center',
      tdClass: 'text-center'
    },
    { label: t('global.player', 2), key: 'id' },
    { label: t('global.team', 2), key: 'teamId' },
    ...trackedPlayerRankingKeys.value.map(
      (opt: Option): TableField => ({
        key: opt.value as string,
        label: opt.text,
        sortable: true,
        thClass: 'text-end',
        tdClass: 'text-end'
      })
    )
  ]
  .filter((field) => {
    if (props.teamId) {
      const removeKey = ['pos', 'teamId']
      return !removeKey.includes(field.key)
    }
    return true
  })
)
const items = computed<CompetitionPlayerStats[]>(() => {
  const result = getPlayersStatsForGames(teams.value, props.games)
    .filter(
      (row: CompetitionPlayerStats) => {
        const noRosterWithGames = !props.teamId && row.gp > 0
        const isRoster = props.teamId && row.teamId === props.teamId
        return noRosterWithGames || isRoster
      }
    )
    .map((row: CompetitionPlayerStats): CompetitionPlayerStats => ({
      ...row,
      id: row.playerId
    }))
  return result
})
</script>
<template>
  <StatsTableComp
    :fields="fields"
    :items="items"
    :limit="limit"
    sorted-key="pts"
    sorted-direction="desc"
    :show-avg="_showAvg"
  >
    <template #filters><slot name="filters"></slot></template>
    <template #actions>
      <template v-if="showAvgUi">
        <div class="py-2">
          <CheckComp v-model="_showAvg" switch button-size="sm">{{ $t('options.stats.showavg') }}</CheckComp>
        </div>
      </template>
    </template>
  </StatsTableComp>
</template>
