<script lang="ts" setup>
import { computed, ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import type {
  Competition,
  CompetitionCategorie,
  CompetitionDoc,
  CompetitionSport,
  Phase
} from '@/types/competitions'

import SelectComp from '@/components/SelectComp.vue'
import CheckComp from '@/components/CheckComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import CheckGroupComp from '@/components/CheckGroupComp.vue'
import type { AwardItem, PlayerStatKey } from '@/types/stats'
import AwardsInput from '../components/AwardsInput.vue'
import useCompetition from '@/composable/useCompetition'
import useLibs from '@/composable/useLibs'
import type { PlayerId, GenderKey } from '@/types/players'

interface IProps {
  value: Competition
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isBusy: false
})

type FormData = {
  title?: string
  date?: string
  sport?: CompetitionSport
  category?: CompetitionCategorie
  gender?: GenderKey
  phases: Phase[]
  trackedStats: PlayerStatKey[]
  awards: AwardItem[]
  isActive?: Boolean
}
const {
  competitionSports: sportsOptions,
  competitionCategories: categoriesOptions,
  genders: gendersOptions,
  playerStatsKeys
} = useOptionsLib()
const { getPlayerName } = useLibs()
const { allPlayers } = useCompetition(props.value.id)

const data = ref<FormData>({
  title: '',
  date: '',
  sport: sportsOptions[0].value,
  gender: undefined,
  category: undefined,
  isActive: false,

  ...props.value,

  awards: Array.isArray(props.value.awards) ? props.value.awards : [],
  trackedStats: Array.isArray(props.value.trackedStats) ? props.value.trackedStats : ['pts']
})

const playersOptions = computed(() =>
  allPlayers.value.map((playerId: PlayerId) => {
    const text = getPlayerName(playerId)
    return {
      text,
      value: playerId
    }
  })
)
const emit = defineEmits(['submit'])

const handleSubmit = (ev: Event) => {
  ev.preventDefault()
  emit('submit', data.value as CompetitionDoc)
}
</script>
<template>
  <form @submit="handleSubmit">
    <FieldComp label="Title">
      <InputComp v-model="data.title" :disabled="isBusy" required />
    </FieldComp>
    <FieldComp label="is active" class="d-flex gap-3 justify-content-end">
      <CheckComp v-model="data.isActive" :disabled="isBusy" switch></CheckComp>
    </FieldComp>
    <FieldComp label="Date">
      <InputComp v-model="data.date" type="date" :disabled="isBusy" required />
    </FieldComp>
    <FieldComp label="Sport">
      <SelectComp v-model="data.sport" :options="sportsOptions" disabled />
    </FieldComp>
    <FieldComp label="Gender">
      <SelectComp v-model="data.gender" :options="gendersOptions" :disabled="isBusy" required />
    </FieldComp>
    <FieldComp label="Categorie">
      <SelectComp
        v-model="data.category"
        :options="categoriesOptions"
        :disabled="isBusy"
        required
      />
    </FieldComp>
    <FieldComp label="Tracked stats">
      <CheckGroupComp
        v-model="data.trackedStats"
        :options="playerStatsKeys"
        :disabled="isBusy"
        buttons
      />
    </FieldComp>
    <FieldComp label="Awards">
      <AwardsInput v-model="data.awards" :players-options="playersOptions" />
    </FieldComp>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit" :is-busy="isBusy">Save</ButtonComp>
    </div>
  </form>
</template>
