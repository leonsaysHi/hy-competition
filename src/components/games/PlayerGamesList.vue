<script lang="ts" setup>
import GameComputedClass from '@/models/GameComputed'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StatsTableComp from '@/components/StatsTableComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import type { TableField, TableItem } from '@/types/comp-table'
import type { Option } from '@/types/comp-fields'
import useCompetition from '@/composable/useCompetition'
import type { CompetitionTeam } from '@/types/teams'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const route = useRoute()
const { competitionId, playerId } = route.params

interface IProps {
  items: GameComputedClass[]
}
const props = withDefaults(defineProps<IProps>(), {})

const { playerRankingKeys, playerStatsSheetKeys } = useOptionsLib()
const { row, getPlayerCompetitionTeam } = useCompetition(competitionId)



const boxScoreKeys = computed<Option[]>(() => {
  if (!row.value?.statsInput) {
    return []
  }
  return row.value?.statsInput === 'play-by-play'
    ? playerRankingKeys.filter((opt: Option) => !['gp'].includes(opt.value))
    : playerStatsSheetKeys.filter((opt: Option) => row.value?.trackedStats.includes(opt.value))
})

const fields = computed(() => {
  const fields = [
    { key: 'datetime', label: t('global.date') },
    { key: 'teamId', label: t('global.gameDetails.opponent.text') },
    { key: 'isWin', label: '', tdClass: 'text-center' },
    ...boxScoreKeys.value.reduce(
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
  ]
  const ptsField = {
    key: 'pts',
    label: t('options.playerStats.text.pts'),
    sortable: true,
    thClass: 'text-end',
    tdClass: 'text-end',
    tfClass: 'text-end fw-bold'
  }
  const pirField = {
    key: 'pir',
    label: t('options.playerStats.text.pir'),
    sortable: true,
    thClass: 'text-end',
    tdClass: 'text-end',
    tfClass: 'text-end fw-bold'
  }
  if (row.value?.statsInput === 'play-by-play') {
    fields.splice(fields.findIndex((field) => field.key === 'time') + 1, 0, ptsField, pirField)
  } else {
    fields.splice(fields.findIndex((field) => field.key === 'isWin') + 1, 0, ptsField)
  }
  return fields
})
const computedGames = computed<TableItem[]>(() => {
  return props.items.map((game: GameComputedClass) => {
    const team = getPlayerCompetitionTeam(playerId) as CompetitionTeam
    const opp = game.getOppScore(team?.id)
    return {
      datetime: game.date.short,
      isFinished: game.isFinished,
      isWin: !opp?.winner,
      teamId: opp?.id,
      ...game.boxScore[playerId]
    }
  })
})
</script>

<template>
  <StatsTableComp :fields="fields" :items="computedGames" show-logo></StatsTableComp>
</template>

