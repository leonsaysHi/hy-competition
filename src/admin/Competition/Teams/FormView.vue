<script lang="ts" setup>
import PlayersSelect from './components/PlayersSelect.vue'
import TeamForm from '@/admin/competition/forms/TeamForm.vue'
import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { useRoute } from 'vue-router'
import type { CompetitionTeam, CompetitionTeamDoc } from '@/types/teams'
import { computed, ref } from 'vue'
import { uploadTeamSponsor } from '@/firebase-storage'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'

const route = useRoute()
const { competitionId, teamId } = route.params
const { isReady: isLibsReady, getTeam } = useLibs()
const { isReady, row } = useCompetition(competitionId)
const { writeTeamDoc: writeCompetitionTeam } = useCompetitionAdmin(competitionId)

const data = computed(() => {
  return row.value?.teams?.find((team: CompetitionTeam) => team.id === teamId)
})

const isBusy = ref(false)

const handleSubmit = async (payload: CompetitionTeam) => {
  isBusy.value = true
  const {
    sponsorUpload,
    ...competitionTeamDoc
  }: {
    sponsorUpload: MediaSource | undefined
    competitionTeamDoc: CompetitionTeamDoc
  } = payload
  if (sponsorUpload) {
    competitionTeamDoc.sponsor = await uploadTeamSponsor(
      sponsorUpload,
      new Date().getTime().toString()
    )
  }
  console.log(competitionTeamDoc)
  await writeCompetitionTeam({
    id: teamId,
    ...competitionTeamDoc
  })
  setTimeout(() => (isBusy.value = false), 150)
}
</script>
<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item" aria-current="page">
        <RouterLink :to="{ name: 'admin-competition-teams' }">Teams list</RouterLink>
      </li>
      <li class="breadcrumb-item active" aria-current="page">Edit team</li>
    </ol>
  </nav>
  <template v-if="!isLibsReady || !isReady">
    <SpinnerComp />
  </template>
  <template v-else>
    <h4>{{ getTeam(teamId)?.title }}</h4>
    <TeamForm :value="data" :is-busy="isBusy" @submit="handleSubmit" />
    <hr />
    <PlayersSelect label="Players" />
  </template>
</template>
