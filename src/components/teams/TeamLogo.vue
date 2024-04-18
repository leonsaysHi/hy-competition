<template>
  <div class="ratio ratio-1x1" :style="styleObj">
    <div>
      <div
        class="position-relative d-flex overflow-hidden w-100 h-100 rounded-4"
        :class="{ border: border }"
      >
        <template v-if="url">
          <ImageComp class="logo" :src="url" :width="size" :title="title" square />
        </template>
        <template v-else>
          <div
            class="flex-grow-1 d-flex align-items-center justify-content-center pt-1 fs-3 font-team text-black"
            :style="`background-color:${team.color}`"
          >
            <strong class="text-muted text-uppercase">{{ short }}</strong>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useLibs from '@/composable/useLibs'
import type { TeamId } from '@/types/teams'
import { computed } from 'vue'
import ImageComp from '../ImageComp.vue'
interface IProps {
  teamId: TeamId
  size?: number
  border?: false
}
const props = withDefaults(defineProps<IProps>(), {
  size: 50,
  border: false
})

const { getTeam } = useLibs()

const styleObj = computed(() => ({
  width: Number(props.size) + 'px',
  height: Number(props.size) + 'px'
}))
const team = computed(() => getTeam(props.teamId))
const url = computed(() => team.value?.logo)
const title = computed(() => team.value?.title)
const short = computed(() => team.value?.short)
</script>
<style lang="scss" scoped>
.logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
