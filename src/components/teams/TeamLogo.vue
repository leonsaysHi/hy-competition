<template>
  <div class="ratio ratio-1x1" :style="styleObj">
    <div>
      <div class="position-relative d-flex overflow-hidden w-100 h-100 border rounded-4">
        <template v-if="url">
          <ImageComp class="logo" :src="url" :width="size" :title="title" square />
        </template>
        <template v-else>
          <div class="flex-grow-1 d-flex align-items-center justify-content-center">
            <span class="placeholder text-muted text-uppercase">{{ placeholder }}</span>
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
}
const props = withDefaults(defineProps<IProps>(), {
  size: 50
})

const { getTeam } = useLibs()

const styleObj = computed(() => ({
  width: Number(props.size) + 'px',
  height: Number(props.size) + 'px'
}))
const team = computed(() => getTeam(props.teamId))
const url = computed(() => team.value?.logo)
const title = computed(() => team.value?.title)
const placeholder = computed(() =>
  team.value?.title ? team.value?.title.toLocaleUpperCase().split(' ').slice(0, 2).join('') : '-'
)
</script>
<style lang="scss" scoped>
.logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.placeholder {
  font-size: 1rem;
}
</style>
