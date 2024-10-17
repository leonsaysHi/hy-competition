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
  Phase,
  StatsInputType
} from '@/types/competitions'

import ModalComp from '@/components/ModalComp.vue'
import SelectComp from '@/components/SelectComp.vue'
import CheckComp from '@/components/CheckComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import type { AwardItem, PlayerStatLineKey } from '@/types/player-stats'
import AwardsInput from '../components/AwardsInput.vue'
import TrackedStatsInput from '../components/TrackedStatsInput.vue'
import useCompetition from '@/composable/useCompetition'
import useLibs from '@/composable/useLibs'
import type { PlayerId, GenderKey } from '@/types/player'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'
import { useRouter } from 'vue-router'
import { extraStatsGroups } from '@/utils/stats/basketball'
const router = useRouter()
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
  statsInput: StatsInputType
  trackedStats: PlayerStatLineKey[]
  isActive?: Boolean
  isOver?: Boolean
  mediasURL?: string
  rulesURL?: string
}
const {
  competitionSports: sportsOptions,
  competitionCategories: categoriesOptions,
  genders: gendersOptions,
  competitionStatsInput: statsInputOptions
} = useOptionsLib()
const { getPlayerName } = useLibs()
const { allPlayers } = useCompetition(props.value.id)
const { deleteCompetitionDoc: deleteCompetition } = useCompetitionAdmin(props.value.id)

const data = ref<FormData>({
  title: '',
  date: '',
  sport: sportsOptions[0].value,
  gender: undefined,
  category: undefined,
  isActive: false,
  isOver: false,
  statsInput: statsInputOptions[0].value,
  trackedStats: [],
  mediasURL: '',
  rulesURL: '',
  ...props.value
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

extraStatsGroups[0].keys.forEach((key:PlayerStatLineKey) => {
  if (!data.value.trackedStats.includes(key)) {
    data.value.trackedStats.push(key)
  }
})

const emit = defineEmits(['submit'])

// Save
const handleSubmit = (ev: Event) => {
  ev.preventDefault()
  emit(
    'submit', 
    {
      ...data.value,
      mediasURL: data.value.mediasURL?.trim() || undefined,
      rulesURL: data.value.rulesURL?.trim() || undefined
    } as CompetitionDoc
  )
}
// Delete
const deleteModal = ref<typeof ModalComp>()
const handleConfirmDelete = () => {
  deleteModal.value?.show()
}
const handleDelete = async () => {
  await deleteCompetition(props.value as Competition)
  router.replace({ name: 'admin' })
}
</script>
<template>
  <form @submit="handleSubmit">
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit" :is-busy="isBusy" size="lg">Save</ButtonComp>
    </div>
    <hr>
    <FieldComp label="Title" required>
      <InputComp v-model="data.title" :disabled="isBusy" required />
    </FieldComp>
    <FieldComp class="d-flex gap-2 justify-content-end">
      <CheckComp v-model="data.isActive" :disabled="isBusy" button>Active</CheckComp>
      <CheckComp v-model="data.isOver" :disabled="isBusy" button>Finished</CheckComp>
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
    <FieldComp label="Stats input">
      <RadioGroupComp
        v-model="data.statsInput"
        :options="statsInputOptions"
        :disabled="isBusy"
        buttons
      />
    </FieldComp>
    <template v-if="data.statsInput === 'sheet'">
      <FieldComp label="Extra tracked statistics">
        <TrackedStatsInput
          v-model="data.trackedStats"
          :disabled="isBusy"
        />
      </FieldComp>
    </template>
    <div class="row row-cols-1 row-cols-md-2">
      <div class="col">
        <FieldComp label="Medias URL">
          <InputComp v-model="data.mediasURL" :disabled="isBusy" />
        </FieldComp>
      </div>
      <div class="col">
        <FieldComp label="Rule URL">
          <InputComp v-model="data.rulesURL" :disabled="isBusy" />
        </FieldComp>
      </div>
    </div>
    <hr>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="danger" :is-busy="isBusy" size="lg" @click="() => handleConfirmDelete()">Delete</ButtonComp>
      <ButtonComp variant="primary" type="submit" :is-busy="isBusy" :disable="!props.value.id" size="lg">Save</ButtonComp>
    </div>
  </form>
  <ModalComp ref="deleteModal" title="Delete player" ok-variant="danger" @ok="handleDelete">
    <h6>Are you sure you want to delete competition <strong>{{ props.value?.title || 'n/a' }}</strong>?</h6>
    <p>This will permanently delete teams compositions and games results.</p>
    <template #modal-ok="{ okTitle, okVariant, okDisabled }">
      <ButtonComp
        :variant="okVariant"
        :disabled="okDisabled"
        :is-busy="isBusy"
        @click="handleDelete"
      >
        {{ okTitle }}
      </ButtonComp>
    </template>
  </ModalComp>
</template>
