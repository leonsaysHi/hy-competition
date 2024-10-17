<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import StatsTableComp from '@/components/StatsTableComp.vue'

import type { CompetitionPlayerStats } from '@/types/computed'
import type { TableField } from '@/types/comp-table'
import type { Option } from '@/types/comp-fields'

import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import type { TeamId } from '@/types/team'
import type GameComputedClass from '@/models/GameComputed'
import { getCompetitionPlayersStats } from '@/utils/stats/basketball'
import RadioGroupComp from '../RadioGroupComp.vue'

const { t } = useI18n()

interface IProps {
  games: GameComputedClass[]
  limit?: number
  teamId?: TeamId
}
const props = withDefaults(defineProps<IProps>(), {
  limit: 0,
})

const route = useRoute()
const { competitionId } = route.params as { competitionId: string; playerId: string }

const { teams, competitionPlayerStatsTableKeys, showAvgUi } = useCompetition(competitionId)

const _showAvg = ref<boolean>(false)
watch(showAvgUi, (v) => _showAvg.value = v)

const statsModeOptions = ref<Option[]>([
  {
    value: true, 
    text: t('options.stats.statsavg')
  },
  {
    value: false, 
    text: t('options.stats.statscumul')
  },
])

const fields = computed(() => [
    {
      label: t('options.rankingStats.text.pos'),
      key: 'pos',
      thClass: 'text-center',
      tdClass: 'text-center'
    },
    { label: t('global.player', 2), key: 'id' },
    { label: t('global.team', 2), key: 'teamId' },
    ...competitionPlayerStatsTableKeys.value.map(
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
  const result = getCompetitionPlayersStats(teams.value, props.games)
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
        <RadioGroupComp v-model="_showAvg" :options="statsModeOptions" size="sm" buttons />
      </template>
    </template>
  </StatsTableComp>
</template>
