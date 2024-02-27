<script lang="ts" setup>
import { ref } from 'vue'
import FieldComp from '@/components/FieldComp.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import ButtonComp from '@/components/ButtonComp.vue'

interface IProps {
  value: FormData | undefined
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isBusy: false
})

type FormData = {
  sponsor?: string
  sponsorUpload: MediaSource | undefined
}
const data = ref<FormData>({
  sponsor: '',
  sponsorUpload: undefined,
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
    <FieldComp label="Sponsor">
      <ImageUpload v-model="data.sponsorUpload" :src="data.sponsor" :disabled="isBusy" />
    </FieldComp>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit" :is-busy="isBusy">Save</ButtonComp>
    </div>
  </form>
</template>
