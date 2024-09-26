<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import ImageComp from '@/components/ImageComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import GamesList from '@/components/games/GamesList.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import useOptionsLib from '@/composable/useOptionsLib'
import LastGames from '@/components/games/LastGames.vue'
import type { CompetitionStanding } from '@/types/computed'
import type { TableField, TableItem } from '@/types/comp-table'
import type { Option } from '@/types/comp-fields'
import type { CompetitionTeam } from '@/types/team'

import { useI18n } from 'vue-i18n'
import GameComputedClass from '@/models/GameComputed'
import type { Phase } from '@/types/competitions'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import { getCompetitionStanding } from '@/utils/stats/basketball'
const { t } = useI18n()
const route = useRoute()
const { competitionId, teamId } = route.params as { competitionId: string; teamId: string }
const { getTeamName } = useLibs()
const { teamStandingKeys } = useOptionsLib()
const { isReady, row, teams, filterGames } = useCompetition(competitionId)

const statsFields: TableField[] = [
  ...teamStandingKeys.map(
    (opt: Option): TableField => ({
      key: opt.value as string,
      label: opt.text,
      thClass: 'text-center',
      tdClass: 'text-center'
    })
  ),
  {
    label: t('options.standingStats.text.hist'),
    key: 'hist',
    thClass: 'text-center',
    tdClass: 'text-center'
  }
]

const competitionComputed = computed<CompetitionStanding | undefined>(() => {
  const standings = getCompetitionStanding(
    teams.value, 
    filterGames({
      teamId: teamId,
      isFinished: true,
      isLive: false
    })
  )
  return standings.find(
    (row: CompetitionStanding) => row.teamId === teamId
  )
})
const statsItem = computed<TableItem[]>(() => {
  return competitionComputed.value ? [competitionComputed.value as unknown as TableItem] : []
})

const selectedPhaseIdx = ref<undefined | number>(undefined)
const phasesOptions = computed(() => {
  return Array.isArray(row.value?.phases) 
    ? [
        {
          text: t('options.phases.overall'),
          value: undefined
        },
        ...row.value.phases
          .map((phase: Phase, idx: number) => ({
            text: phase.title,
            value: idx
          }))
    ]
    : []
})

const competitionTeam = computed(() => teams.value?.find((team: CompetitionTeam) => team.id === teamId))

const gamesList = computed<GameComputedClass[]>(() => filterGames({
    teamId: teamId,
    isFinished: true,
    isLive: false
  })
  .reverse()
)

const rankingGames = computed<GameComputedClass[]>(() => filterGames({
    phaseIdx: Number(selectedPhaseIdx.value),
    isFinished: true,
    isLive: false
  })
)

</script>
<template>
  <div>
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="position-relative mt-4 pb-3 d-flex flex-column align-items-center">
        <div class="position-absolute top-0 end-0">
          <ImageComp :src="competitionTeam?.sponsor" :width="100" />
        </div>
        <TeamLogo :team-id="teamId" :size="150" />
        <div class="display-3 fw-bold font-team">{{ getTeamName(teamId) }}</div>
      </div>
      <TableComp 
        :fields="statsFields" 
        :items="statsItem"
      >
        <template #hist="{ value }">
          <LastGames :items="value" :length="5" />
        </template>
      </TableComp>
      <h3>{{ t('global.ranking') }}</h3>
      <CompetitionRanking :value="competitionRankings" :team-id="teamId" class="mb-2" />
      <h3>{{ t('global.game', 2) }}</h3>
      <GamesList :items="gamesList" />
      <hr />
      <h3>{{ t('global.player', 2) }}</h3>
      <CompetitionRanking 
        :games="rankingGames" 
        :team-id="teamId" 
      >
        <template #filters>
          <RadioGroupComp 
            v-model="selectedPhaseIdx" 
            :options="phasesOptions" 
            button-variant="light"
            button-variant-active="primary"
            size="sm" 
            buttons 
          />
        </template>
      </CompetitionRanking>
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
