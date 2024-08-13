<script lang="ts" setup>
import GameComputedClass from '@/models/GameComputed'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StatsTableComp from '@/components/StatsTableComp.vue'
import type { TableField, TableItem } from '@/types/comp-table'
import type { Option } from '@/types/comp-fields'
import useCompetition from '@/composable/useCompetition'
import type { CompetitionTeam } from '@/types/teams'
import { useI18n } from 'vue-i18n'
import type { CompetitionId } from '@/types/competitions'
const { t } = useI18n()

const route = useRoute()
const { competitionId, playerId } = route.params as { competitionId: string; playerId: string }

interface IProps {
  items: GameComputedClass[]
}
const props = withDefaults(defineProps<IProps>(), {})

const { getPlayerCompetitionTeam, trackedPlayerRankingKeys } = useCompetition(competitionId)

const fields = computed(() => {
  const fields = [
    { key: 'datetime', label: t('global.date'), tdClass: 'pt-1 lh-1' },
    { key: 'teamId', label: t('global.gameDetails.opponent.text') },
    { key: 'isWin', label: '', tdClass: 'text-center' },
    ...trackedPlayerRankingKeys.value.map(
      (opt: Option): TableField => ({
          key: opt.value,
          label: opt.text,
          sortable: true,
          thClass: 'text-end',
          tdClass: 'text-end'
        })
      ),
  ]
  const ptsField = {
    key: 'pts',
    label: t('options.playerStats.text.pts'),
    sortable: true,
    thClass: 'text-end',
    tdClass: 'text-end',
    tfClass: 'text-end fw-bold'
  }
  fields.splice(fields.findIndex((field) => field.key === 'isWin') + 1, 0, ptsField)
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
  <StatsTableComp :fields="fields" :items="computedGames" show-logo>
    <template #title><h3>{{ t('global.game', 2) }}</h3></template>
  </StatsTableComp>
</template>
