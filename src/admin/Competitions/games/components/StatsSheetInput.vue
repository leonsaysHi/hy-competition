<template>
  <div class="hstack gap-1">
    <template v-if="!disabled">
      <RouterLink class="btn btn-primary" :to="{ name: 'box-score-record', params: { competitionId, gameId } }"
      >Record box-score</RouterLink
    >
    </template>
    <template v-else>
      <ButtonComp disabled variant="primary">Record box-score</ButtonComp>
    </template>
    
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
import { useRoute, useRouter } from 'vue-router'
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
const router = useRouter()
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

const handleOpenRecord = () => {
  const recordRoute = { name: 'box-score-record', params: { competitionId, gameId } }
  /*
  const route = router.resolve(recordRoute)
  const isProd = window.location.pathname.includes('/app/')
  const url = new URL(route.href, window.location.origin + (isProd ? '/app' : '')).href
  window.open(url, '_blank')
  */
  router.push(recordRoute)
}

const handleDelete = async () => {
  if (await handleConfirmDelete()) {
    emit('reset-stats-sheet')
  }
}
</script>

<style scoped lang="scss"></style>
