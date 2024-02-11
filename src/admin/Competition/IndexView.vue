<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import useCompetitions from '@/composable/useCompetitions'

import { CompetitionsKey, TeamsKey, PlayersKey } from '@/types/symbols'
import { inject, computed } from 'vue'
import CompetitionClass from '@/models/Competition'

const route = useRoute()
const { competitionId } = route.params
const competitions = inject(CompetitionsKey)
const teamsLib = inject(TeamsKey)
const playersLib = inject(PlayersKey)

const { 
  getRowGames: getCompetitionGames, 
  getRowTeams: getCompetitionTeams 
} = useCompetitions()
const row = competitions.value.find(r => r.id === competitionId) as Competition
const games = getCompetitionGames(competitionId as CompetitionId) as Ref<Game[] | undefined>
const teams = getCompetitionTeams(competitionId as CompetitionId) as Ref<CompetitionTeam[] | undefined>

const competitionClass = computed((): CompetitionClass | null => {
  return row && teams.value && games.value 
  ? new CompetitionClass(
    row,
    teams.value, 
    games.value, 
    { players: playersLib.value, teams: teamsLib.value }
  )
  : null
})
</script>
<template>
    <template v-if="!competitionClass">
      ...loading

    </template>
    <template v-else>
      <RouterView
        :item="competitionClass"
      />
    </template>
</template>
