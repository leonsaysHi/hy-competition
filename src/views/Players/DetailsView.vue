<script lang="ts" setup>
import { useRoute } from 'vue-router'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { computed } from 'vue'
import type { PlayerId } from '@/types/player'
import usePlayerComputed from '@/composable/usePlayerComputed'
import type { CompetitionPlayerComputed } from '@/types/computed'
import { useI18n } from 'vue-i18n'
import { getAvg, formatAvg } from '@/utils/maths'
import StatsTableComp from '@/components/StatsTableComp.vue'
import type { PlayerCalculatedStatsKey } from '@/types/player-stats'
import { playerCalculatedStatsKeys } from '@/utils/stats/basketball'
const { t } = useI18n()
const route = useRoute()
const { playerId } = route.params as { playerId: PlayerId }

const { isReady, getPlayer } = useLibs()
const { isReady: isPlayerComputedReady, rows } = usePlayerComputed(playerId)
const player = computed(() => getPlayer(playerId))

const fields = computed(() => [
  { key: 'competitionId', label: t('global.competition', 2) },
  { key: 'teamId', label: t('global.team') },
  ...playerCalculatedStatsKeys.map((key: PlayerCalculatedStatsKey) => ({
    key,
    label: t(`options.playerStats.text.${key}`),
    thClass: 'text-end',
    tdClass: 'text-end'
  }))
])

const stats = computed(() => {
  const gp = Array.isArray(rows.value)
    ? rows.value?.reduce((total: number, item: CompetitionPlayerComputed) => (total += item.gp), 0)
    : 0
  const pts = Array.isArray(rows.value)
    ? rows.value?.reduce(
        (total: number, item: CompetitionPlayerComputed) => (total += item.pts),
        0
      )
    : 0
  return [
    {
      key: 'gp',
      text: t('options.playerStats.long.gp'),
      value: gp
    },
    {
      key: 'pts',
      text: t('options.playerStats.long.ptsavg'),
      value: formatAvg(getAvg(pts, gp))
    }
  ]
})
const items = computed(() => {
  return rows.value?.map((row: CompetitionPlayerComputed) => {
    return {
      ...row,
      competitionId: row.id,
      gp: row.gp
    }
  })
})
</script>
<template>
  <div>
    <template v-if="!isReady || !isPlayerComputedReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <div>
        <h1 class="mb-4 vstack gap-1 lh-1 display-2 fw-bold font-name">
          <span>{{ player.fname }}</span
          ><span>{{ player.lname }}</span>
        </h1>
        <div class="mb-3 hstack gap-2">
          <template v-for="(stat, idx) in stats" :key="stat.key">
            <template v-if="idx > 0">
              <div class="vr"></div>
            </template>
            <div class="vstack gap-2 justify-content-between text-center">
              <strong class="px-4 lh-1">{{ stat.text }}</strong>
              <strong class="display-3">{{ stat.value }}</strong>
            </div>
          </template>
        </div>
      </div>
      <StatsTableComp :fields="fields" :items="items" show-logo show-avg show-avg-ui></StatsTableComp>
    </template>
  </div>
</template>
