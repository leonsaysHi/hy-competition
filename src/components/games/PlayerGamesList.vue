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

const { playerRankingKeys  } = useOptionsLib()
const { getPlayerCompetitionTeam } = useCompetition(competitionId)

const boxScoreKeys: Option[] = playerRankingKeys.filter((opt: Option) => !['gp'].includes(opt.value))


const fields = computed(() => [
  { key: 'datetime', label: t('global.date'), tdClass: 'lh-1' },
  { key: 'opp', label: t('global.gameDetails.opponent.text') },
  { key: 'isWin', label: '', tdClass: 'text-center' },
  ...boxScoreKeys
    .reduce(
      (fields: TableField[], opt): TableField[] => [
        ...fields,
        {
          key: opt.value,
          label: opt.text,
          sortable: true,
          thClass: 'text-end',
          tdClass: 'text-end',
          tfClass: 'text-end fw-bold'
        }
      ],
      []
    )
])
const computedGames = computed<TableItem[]>(() => {
  return props.items.map((game: GameComputedClass) => {
    const team = getPlayerCompetitionTeam(playerId) as CompetitionTeam
    const opp = game.getOppScore(team?.id)
    return {
      datetime: game.date.short,
      isFinished: game.isFinished,
      isWin: !opp?.winner,
      opp: opp?.id,
      ...game.boxScore[playerId]
    }
  })
})
</script>

<template>
  <StatsTableComp :fields="fields" :items="computedGames"></StatsTableComp>
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
