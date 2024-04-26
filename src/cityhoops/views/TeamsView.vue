<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import ViewHero from '../components/layout/ViewHero.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import type { CompetitionTeam } from '@/types/teams'
import useLibs from '@/composable/useLibs'
import { computed } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'

const route = useRoute()
const router = useRouter()
const { competitionId } = route.params as { competitionId: string }
const { isReady, teams } = useCompetition(competitionId)
const { getTeam } = useLibs()

const items = computed(() => {
  return teams.value?.map((row: CompetitionTeam) => {
    const team = getTeam(row.id)
    return {
        ...row,
        ...team
    }
  })
})
</script>
<template>
  <div>
    <template v-if="!isReady">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else>
      <ViewHero>
        <h1>Teams</h1>
      </ViewHero>
      <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5">
        <template v-for="team in items" :key="team.id">
          <div class="col">
            <ButtonComp 
                variant="light" 
                class="border p-2 vstack align-items-center mb-3"
                @click="router.push({ name: 'competition-team', params: { competitionId, teamId: team.id }})"
            >
              <TeamLogo :team-id="team.id" :size="150" />
                <h2 class="mt-2 font-team text-center">{{ team.title }}</h2>
            </ButtonComp>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
