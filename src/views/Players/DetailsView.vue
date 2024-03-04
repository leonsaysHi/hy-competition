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
import type { CompetitionRankingComputed } from '@/models/CompetitionComputed'
import type { PlayerStatKey } from '@/types/stats'
import type { Option } from '@/types/comp-fields'

const route = useRoute()
const { playerId } = route.params as { playerId: PlayerId }

const { statsKeys, getCategory } = useOptionsLib()
const { isReady, getPlayer, getCompetition, getTeamName } = useLibs()
const { isReady: isPlayerComputedReady, rows } = usePlayerComputed(playerId)
const player = computed(() => getPlayer(playerId))
const fields = computed(() => [
  { key: 'competition', label: 'Competitions' },
  { key: 'teamId', label: 'Team' },
  { key: 'gp', label: 'GP' },
  ...statsKeys.map((opt: Option) => ({
    key: opt.value,
    label: opt.text,
    thClass: 'text-end',
    tdClass: 'text-end'
  }))
])
const items = computed(() => {
  return rows.value?.map((row: CompetitionRankingComputed) => {
    const competition = getCompetition(row.id)

    return {
      ...row,
      competition,
      ...statsKeys.reduce((stats, opt: Option) => {
        const key = opt.value as PlayerStatKey
        return {
          ...stats,
          [key]: competition?.trackedStats.includes(key) ? row[key] : undefined
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
        <h1 class="display-6 fw-bold jersey-name">{{ player.fname }} {{ player.lname }}</h1>
      </div>

      <p>List current and past competitions w/ avg, awards</p>
      <TableComp :fields="fields" :items="items">
        <template #competition="{ value }">
          <RouterLink
            class="d-flex flex-column align-items-start"
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
