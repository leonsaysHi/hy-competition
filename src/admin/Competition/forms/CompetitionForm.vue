<script lang="ts" setup>
import { ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import type {
  CompetitionCategorie,
  CompetitionGender,
  CompetitionSport
} from '@/types/competitions'
import type { Option } from '@/types/comp-fields'
import SelectComp from '@/components/SelectComp.vue'
import CheckComp from '@/components/CheckComp.vue'

const sportsOptions: Option[] = [
  {
    text: 'Basketball 5x5',
    value: 'basketball5x5'
  }
]
const categoriesOptions: Option[] =
  'U6|U8|U9|U10|U11|U12|U13|U14|U15|U16|U17|U18|Senior|+30|+35|+40|+45'.split('|').map((str) => ({
    text: str,
    value: str
  }))
const gendersOptions: Option[] = 'M|F|MF'.split('|').map((str) => ({
  text: str,
  value: str
}))

interface IProps {
  value: FormData
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
  gender?: CompetitionGender
  isActive?: Boolean
}
const data = ref<FormData>({
  title: '',
  date: '',
  sport: '',
  gender: '',
  category: '',
  isActive: '',

  ...props.value
})

const emit = defineEmits(['submit'])

const handleSubmit = (ev: Event) => {
  ev.preventDefault()
  emit('submit', data.value)
}
</script>
<template>
  <form @submit="handleSubmit">
    <FieldComp label="Title">
      <InputComp v-model="data.title" required />
    </FieldComp>
    <FieldComp label="is active" class="d-flex gap-3 justify-content-end">
      <CheckComp v-model="data.isActive" switch></CheckComp>
    </FieldComp>
    <FieldComp label="Date">
      <InputComp v-model="data.date" type="date" required />
    </FieldComp>
    <FieldComp label="Sport">
      <SelectComp v-model="data.sport" :options="sportsOptions" disabled />
    </FieldComp>
    <FieldComp label="Gender">
      <SelectComp v-model="data.gender" :options="gendersOptions" required />
    </FieldComp>
    <FieldComp label="Categorie">
      <SelectComp v-model="data.category" :options="categoriesOptions" required />
    </FieldComp>

    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit" :disabled="isBusy" :isBusy="isBusy"
        >Save</ButtonComp
      >
    </div>
  </form>
</template>
