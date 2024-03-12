<script lang="ts" setup>
import { useRoute } from 'vue-router'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import { computed } from 'vue'
import type { PlayerId } from '@/types/players'
import usePlayerComputed from '@/composable/usePlayerComputed'
import useOptionsLib from '@/composable/useOptionsLib'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import type { CompetitionRankingComputed } from '@/types/computed'
import type { PlayerStatKey } from '@/types/stats'
import type { Option } from '@/types/comp-fields'
import { useI18n } from 'vue-i18n'
import { getAvg } from '@/utils/maths'
const { t } = useI18n()
const route = useRoute()
const { playerId } = route.params as { playerId: PlayerId }

const { playerStatsKeys, playerRankingKeys, getCategory } = useOptionsLib()
const { isReady, getPlayer, getCompetition, getTeamName } = useLibs()
const { isReady: isPlayerComputedReady, rows } = usePlayerComputed(playerId)
const player = computed(() => getPlayer(playerId))
const fields = computed(() => [
  { key: 'competition', label: t('global.competition', 2) },
  { key: 'teamId', label: t('global.team', 2) },
  ...playerRankingKeys.map((opt: Option) => ({
    key: opt.value,
    label: opt.text,
    thClass: 'text-end',
    tdClass: 'text-end'
  }))
])

const stats = computed(() => {
  const gp = Array.isArray(rows.value)
    ? rows.value?.reduce((total: number, item: CompetitionRankingComputed) => (total += item.gp), 0)
    : 0
  const pts = Array.isArray(rows.value)
    ? rows.value?.reduce(
        (total: number, item: CompetitionRankingComputed) => (total += item.pts),
        0
      )
    : 0
  return [
    {
      key: 'gp',
      text: t('options.rankingStats.long.gp'),
      value: gp
    },
    {
      key: 'pts',
      text: t('options.rankingStats.long.ptsAvg'),
      value: getAvg(pts, gp)
    }
  ]
})
const items = computed(() => {
  return rows.value?.map((row: CompetitionRankingComputed) => {
    const competition = getCompetition(row.id)

    return {
      ...row,
      competition,
      gp: row.gp,
      ...playerStatsKeys.reduce((stats, opt: Option) => {
        const key = opt.value as PlayerStatKey
        return {
          ...stats,
          [key]: competition?.trackedStats.includes(key) ? getAvg(row[key], row.gp) : undefined
        }
      }, {})
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
        <h1 class="mb-4 vstack gap-1 lh-1 display-2 fw-bold jersey-name">
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
      <TableComp :fields="fields" :items="items">
        <template #competition="{ value }">
          <RouterLink
            class="d-flex flex-column align-items-start text-decoration-none"
            :to="{ name: 'competition', params: { competitionId: value.id } }"
          >
            <div>{{ value.title }}</div>
            <div class="d-flex gap-3 small text-body-secondary text-nowrap">
              <small>{{ value.date }}</small>
              <small>{{ getCategory(value.category)?.text }}</small>
            </div>
          </RouterLink>
        </template>
        <template #teamId="{ value }">
          <div class="d-flex align-items-center gap-2">
            <TeamLogo :team-id="value" />
            <span class="jersey-team lh-1">{{ getTeamName(value) }}</span>
          </div>
        </template>
      </TableComp>
    </template>
  </div>
</template>
