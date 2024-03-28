<template>
  <div>
    <div class="hstack gap-1">
      <template v-if="isReady && !model?.boxScore">
        <RouterLink
          class="btn btn-primary"
          :to="{ name: 'play-by-play', params: { competitionId, gameId } }"
          >Start recording Play-by-play</RouterLink
        >
      </template>
      <template v-else-if="isReady && model?.boxScore">
        <RouterLink
          class="btn btn-primary"
          :to="{ name: 'play-by-play', params: { competitionId, gameId } }"
          >Resume recording</RouterLink
        >
        <RouterLink
          class="btn btn-primary"
          :to="{
            name: 'admin-competition-edit-game-play-by-play',
            params: { competitionId, gameId }
          }"
          >Edit</RouterLink
        >
        <ButtonComp class="ms-auto" variant="danger" @click="handleDelete">Delete</ButtonComp>
        <template v-if="confirmDatas">
          <ModalComp
            hide-heacer
            ok-variant="danger"
            @ok="confirmDatas.ok"
            @cancel="confirmDatas.cancel"
            show
          >
            Are you sure
          </ModalComp>
        </template>
      </template>
    </div>
    <template v-if="boxScoreItemsByTeam.length">
      <hr />
      <template v-for="row in boxScoreItemsByTeam" :key="row.teamId">
        <div class="jersey-team">{{ row.title }}</div>
        <StatsTableComp
          :fields="fields"
          :items="row.items"
          sorted-key="pts"
          sorted-direction="desc"
          show-total
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import usePlayByPlay from '@/composable/usePlayByPlay'
import type { TableField } from '@/types/comp-table'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { CompetitionPlayer, PlayerId } from '@/types/players'
import useLibs from '@/composable/useLibs'
import useOptionsLib from '@/composable/useOptionsLib'
import StatsTableComp from '@/components/StatsTableComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import type { Team, TeamId } from '@/types/teams'
import type { PlayerStats } from '@/types/stats'
const { t } = useI18n()

const route = useRoute()
const { competitionId, gameId } = route.params
const { isReady, model, deletePlayStacks } = usePlayByPlay(competitionId, gameId)

const { getPlayer, getTeam } = useLibs()
const { playerStatsKeys } = useOptionsLib()

const fields = computed(() => {
  const fields = [
    { label: '#', key: 'number' },
    { label: t('global.player'), key: 'id', tdClass: 'fw-bold' },
    ...playerStatsKeys.reduce(
      (fields: TableField[], opt): TableField[] => [
        ...fields,
        {
          key: opt.value,
          label: opt.text,
          sortable: true,
          thClass: 'text-end',
          tdClass: 'text-end',
          tfClass: 'text-end fw-bold'
        }
      ],
      []
    )
  ]
  return fields
})
const boxScoreItemsByTeam = computed(() => {
  return model.value?.rosters
    ? Object.keys(model.value?.rosters).reduce(
        (
          boxScoreItems: (Team & { items: PlayerStats & { dnp: boolean } & CompetitionPlayer })[],
          teamId: TeamId
        ) => {
          boxScoreItems.push({
            ...getTeam(teamId),
            items: Object.keys(model.value.rosters[teamId]).map((playerId: PlayerId) => ({
              ...getPlayer(playerId),
              ...model.value?.boxScore[playerId]
            }))
          })
          return boxScoreItems
        },
        []
      )
    : []
})

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
const handlePublish = () => {
  // TODO
}
const handleDelete = async () => {
  if (await handleConfirmDelete()) {
    deletePlayStacks()
  }
}
</script>

<style scoped lang="scss"></style>
