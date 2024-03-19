<template>
  <div>
    <RouterLink
      class="btn btn-primary btn-sm"
      :to="{ name: 'play-by-play', params: { competitionId, gameId } }"
      >Play-by-play</RouterLink
    >

    <template v-if="isReady && model?.boxScore">
      <hr />
      <StatsTableComp
        :fields="fields"
        :items="boxScoreItems"
        sorted-key="pts"
        sorted-direction="desc"
        show-total
      ></StatsTableComp>
    </template>
  </div>
</template>

<script setup lang="ts">
import usePlayByPlay from '@/composable/usePlayByPlay';
import type { TableField } from '@/types/comp-table';
import { computed } from 'vue';
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { PlayerId } from '@/types/players';
import useLibs from '@/composable/useLibs';
import useOptionsLib from '@/composable/useOptionsLib';
import StatsTableComp from '@/components/StatsTableComp.vue';
const { t } = useI18n()

const route = useRoute()
const { competitionId, gameId } = route.params
const { isReady, model } = usePlayByPlay(competitionId, gameId)


const { getPlayer } = useLibs()
const { playerRankingKeys } = useOptionsLib()

const boxScoreKeys: Option[] = playerRankingKeys.filter(
  (opt: Option) => !['gp'].includes(opt.value)
)

const fields = computed(() => {
  const fields = [
    { label: '#', key: 'number' },
    { label: t('global.player'), key: 'id', tdClass: 'fw-bold' },
    ...boxScoreKeys.reduce(
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
  ]
  return fields
})
const boxScoreItems = computed(() => {
  return Object.keys(model.value?.boxScore)
    .map((playerId: PlayerId) => ({
    ...getPlayer(playerId),
    ...model.value?.boxScore[playerId]
  }))
})

</script>

<style scoped lang="scss"></style>
