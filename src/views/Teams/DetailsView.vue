<script lang="ts" setup>
import { useRoute } from 'vue-router'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import { computed } from 'vue'
import type { TeamId } from '@/types/teams'
import useOptionsLib from '@/composable/useOptionsLib'
import useTeamComputed from '@/composable/useTeamComputed'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import LastGames from '@/components/games/LastGames.vue'
import type { CompetitionStandingComputed } from '@/types/computed'
import type { GamesHist, TeamStatKey } from '@/types/stats'
import { getOrd } from '@/utils/maths'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const route = useRoute()
const { teamId } = route.params as { teamId: TeamId }

const { teamStandingKeys, getCategory } = useOptionsLib()
const { isReady, getTeam, getCompetition } = useLibs()
const { isReady: isTeamComputedReady, rows } = useTeamComputed(teamId)
const team = computed(() => getTeam(teamId))
const fields = computed(() => [
  { key: 'competition', label: t('global.competition', 2) },
  { key: 'rank', label: t('options.standingStats.text.pos') },
  ...teamStandingKeys.map((opt: Option) => ({
    key: opt.value,
    label: opt.text,
    thClass: 'text-end',
    tdClass: 'text-end'
  })),
  { key: 'hist', label: 'L5', thClass: 'text-end', tdClass: 'text-end' }
])
const stats = computed(() => {
  return ['gp', 'wins'].map((key: TeamStatKey) => {
    const opt = teamStandingKeys.find((opt: Option) => opt.value === key)
    const total = Array.isArray(items.value)
      ? items.value.reduce(
          (total: number, item: CompetitionStandingComputed) => (total += item[key]),
          0
        )
      : 0
    return {
      key,
      text: opt?.long,
      total
    }
  })
})
const hist = computed<GamesHist>(
  (): GamesHist =>
    Array.isArray(items.value)
      ? items.value.reduce((result: GamesHist, item: CompetitionStandingComputed) => {
          result.push(...item.hist)
          const startIdx = Math.max(result.length - 5, 0)
          return result.slice(startIdx, startIdx + 5)
        }, [] as GamesHist)
      : []
)
const items = computed(() => {
  return rows.value?.map((row: CompetitionStandingComputed) => {
    const competition = getCompetition(row.id)

    return {
      competition,
      rank: row.pos + getOrd(row.pos) || row.playoff + getOrd(row.playoff) || '-',
      ...row
    }
  })
})
</script>
<template>
  <div>
    <template v-if="!isReady || !isTeamComputedReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="mb-3 d-flex align-items-start gap-3">
        <TeamLogo :team-id="teamId" :size="150" />
        <div>
          <h1 class="display-2 fw-bold font-team">{{ team?.title }}</h1>
          <div class="hstack gap-2">
            <template v-for="stat in stats" :key="stat.key">
              <div class="vstack gap-2 justify-content-between text-center">
                <strong class="px-4 lh-1">{{ stat.text }}</strong>
                <strong class="display-3">{{ stat.total }}</strong>
              </div>
              <div class="vr"></div>
            </template>
            <div class="vstack gap-2 text-center">
              <div class="vstack gap-2 justify-content-between text-center">
                <strong class="px-4 lh-1">Last 5</strong>
                <div class="flex-grow-1 d-flex justify-content-center align-items-center">
                  <LastGames :items="hist" :length="5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TableComp :fields="fields" :items="items">
        <template #competition="{ value }">
          <RouterLink
            class="text-decoration-none d-flex flex-column align-items-start"
            :to="{ name: 'competition', params: { competitionId: value.id } }"
          >
            <div class="fw-bold">{{ value.title }}</div>
            <div class="d-flex gap-3 small text-body-secondary">
              <small>{{ value.date }}</small>
              <small>{{ getCategory(value.category)?.text }}</small>
            </div>
          </RouterLink>
        </template>
        <template #hist="{ value }">
          <LastGames :items="value" :length="5" />
        </template>
      </TableComp>
    </template>
  </div>
</template>
