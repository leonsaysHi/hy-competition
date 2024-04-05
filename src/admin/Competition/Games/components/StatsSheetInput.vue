<template>
  <div class="hstack gap-1">
    <RouterLink
      class="btn btn-primary"
      :class="{ disabled }"
      :to="{ name: 'box-score-record', params: { competitionId, gameId } }"
      >Record box-score</RouterLink
    >
    <ButtonComp class="ms-auto" variant="danger" :disabled="disabled" @click="handleDelete"
      >Reset</ButtonComp
    >
    <template v-if="confirmDatas">
      <ModalComp
        hide-heacer
        ok-variant="danger"
        @ok="confirmDatas.ok"
        @cancel="confirmDatas.cancel"
        is-shown
      >
        Are you sure?
      </ModalComp>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import type { GameId } from '@/types/games'
import type { CompetitionId } from '@/types/competitions'

interface IProps {
  disabled?: boolean
}
withDefaults(defineProps<IProps>(), {
  disabled: false
})

const emit = defineEmits(['reset-stats-sheet'])
const route = useRoute()
const { competitionId, gameId } = route.params as { competitionId: CompetitionId; gameId: GameId }

const confirmDatas = ref()
const handleConfirmDelete = () => {
  return new Promise((resolve) => {
    const resp = (resp: boolean) => {
      resolve(resp)
      confirmDatas.value = undefined
    }
    confirmDatas.value = {
      ok: () => resp(true),
      cancel: () => resp(false)
    }
  })
}

const handleDelete = async () => {
  if (await handleConfirmDelete()) {
    emit('reset-stats-sheet')
  }
}
</script>

<style scoped lang="scss"></style>
