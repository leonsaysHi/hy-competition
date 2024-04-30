<script lang="ts" setup>
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useCompetition from '@/composable/useCompetition'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import ViewHero from '../components/layout/ViewHero.vue'
import useCompetitionPhasesGroups from '@/composable/useCompetitionPhasesGroups'

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const { isReady } = useCompetition(competitionId)
const {
  selectedPhaseIdx,
  selectedPhase,
  phasesOptions,
  selectedGroupIdx,
  selectedGroup,
  groupsOptions
} = useCompetitionPhasesGroups()
</script>
<template>
  <div>
    <template v-if="!isReady">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else>
      <ViewHero>
        <h1>Tabla y estadística</h1>
        <template #nav>
          <template v-if="phasesOptions && phasesOptions.length > 1">
            <DropdownComp
              v-model="selectedPhaseIdx"
              :options="phasesOptions"
              variant="light"
              size="lg"
              class="fw-bold fz-5"
              :disabled="phasesOptions.length === 1"
            />
          </template>
          <template v-if="groupsOptions && groupsOptions.length > 1">
            <RadioGroupComp v-model="selectedGroupIdx" :options="groupsOptions" buttons />
          </template>
        </template>
      </ViewHero>

      <template v-if="selectedPhase && selectedGroup">
        <h2>Tabla</h2>
        <CompetitionStanding :value="selectedGroup.standing" />
        <h2>Líderes por categorías</h2>
        <CompetitionRanking :value="selectedGroup.ranking" :limit="25" />
      </template>
    </template>
  </div>
</template>
