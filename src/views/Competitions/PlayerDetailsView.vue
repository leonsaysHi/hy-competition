<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import StatsTableComp from '@/components/StatsTableComp.vue'
import type { CompetitionTeam } from '@/types/team'
import type { CompetitionPlayer } from '@/types/player'
import useLibs from '@/composable/useLibs'

import TeamLogo from '@/components/teams/TeamLogo.vue'
import ImageComp from '@/components/ImageComp.vue'
import useCompetition from '@/composable/useCompetition'
import PlayerGamesList from '@/components/games/PlayerGamesList.vue'
import type { Option } from '@/types/comp-fields'
import type { TableField } from '@/types/comp-table'
import type { CompetitionPlayerStats } from '@/types/computed'

import { useI18n } from 'vue-i18n'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import type { Phase } from '@/types/competitions'
import { getCompetitionPlayersStats } from '@/utils/stats/basketball'
const { t } = useI18n()
const route = useRoute()
const { competitionId, playerId } = route.params as { competitionId: string; playerId: string }

const { getPlayerName } = useLibs()
const {
  isReady: isCompetitionReady,
  getCompetitionPlayer,
  getPlayerCompetitionTeam,
  filterGames,
  row,
  showAvgUi,
  teams,
  competitionPlayerStatsTableKeys
} = useCompetition(competitionId)

const competitionTeam = computed<CompetitionTeam | undefined>(() =>
  getPlayerCompetitionTeam(playerId)
)
const competitionPlayer = computed<CompetitionPlayer | undefined>(() =>
  getCompetitionPlayer(playerId)
)

const showAvg = ref<boolean>(false)
watch(showAvgUi, (v) => showAvg.value = v)

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
const selectedPhaseIdx = ref<undefined | number>(undefined)
const phasesOptions = computed(() => {
  const result = []
  if (Array.isArray(row.value?.phases))  {
    if (row.value.phases.length > 1) {
      result.push({
        text: t('options.phases.overall'),
        value: undefined
      })
    }
    result.push(...row.value.phases
      .map((phase: Phase, idx: number) => ({
        text: phase.title,
        value: idx,
        disabled: row.value?.phases.length === 1
      }))
    )
  }
  return result
})

const gamesList = computed(() => filterGames({
    phaseIdx: Number(selectedPhaseIdx.value),
    playerId: playerId,
    isFinished: true,
    isLive: false
  })
)


const statsFields = computed<TableField[]>(() => {
  const fields = competitionPlayerStatsTableKeys.value.map(
    (opt: Option): TableField => ({
      key: opt.value as string,
      label: opt.text,
      sortable: true,
      thClass: 'text-end',
      tdClass: 'text-end'
    })
  )
  return fields
})

const statsItem = computed<CompetitionPlayerStats[]>(() => {
  return getCompetitionPlayersStats(teams.value, gamesList.value)
    .filter((stats: CompetitionPlayerStats) => stats.playerId === playerId)
})
</script>
<template>
  <div>
    <template v-if="!isCompetitionReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="mt-4 pb-3 d-flex gap-3">
        <div>
          <TeamLogo :team-id="competitionTeam?.id" :size="150" />
        </div>
        <div>
          <div class="display-1 text-body-secondary lh-1 font-number">
            #<strong>{{ competitionPlayer?.number }}</strong>
          </div>
          <h1 class="display-6 fw-bold font-name">{{ getPlayerName(playerId) }}</h1>
        </div>
        <div class="ms-auto align-self-end">
          <div class="d-flex flex-column align-items-center gap-2">
            <ImageComp :src="competitionTeam?.sponsor" :width="100" />
          </div>
        </div>
      </div>
      <StatsTableComp 
        :fields="statsFields" 
        :items="statsItem" 
        :show-avg="showAvg"
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
        <template #actions>
          <template v-if="showAvgUi">
            <RadioGroupComp v-model="showAvg" :options="statsModeOptions" size="sm" buttons />
          </template>
        </template>
      </StatsTableComp>
      <hr />
      <PlayerGamesList :items="gamesList" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
