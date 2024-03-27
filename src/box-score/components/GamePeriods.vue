<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
import { add } from '@/utils/maths'
import { computed, ref } from 'vue'

interface IProps {
  periodIdx: number
  periodsItems: number[]
}
withDefaults(defineProps<IProps>(), {
})

const emit = defineEmits(['change-period'])

const handleJump = (n: 1 | -1) => {
  emit('change-period', n)
}
</script>
<template>
  <div class="hstack text-white bg-dark">
    <div class="flex-grow-0 vstack gap-1">
      
    </div>
    <div class="vstack">
      <div class="hstack justify-content-center align-items-end display-2 lh-1 font-scoreboard">
        Q {{ periodIdx + 1}}
      </div>
      <div class="hstack gap-2 justify-content-center">
        <template v-for="(p, idx) in periodsItems" :key="idx">
          <i
            class="bi bi-circle-fill"
            :class="p === 1 ? 'text-warning' : p === 0 ? 'text-white' : 'text-secondary'"
          ></i>
        </template>
      </div>
    </div>
    <div class="flex-grow-0 vstack gap-1">
      <ButtonComp
        @click="() => handleJump(-1)"
        variant="primary"
        size="lg"
        ><i class="bi bi-rewind-fill"></i
      ></ButtonComp>
      <ButtonComp
        @click="() => handleJump(1)"
        variant="primary"
        size="lg"
        ><i class="bi bi-fast-forward-fill"></i
      ></ButtonComp>
    </div>
  </div>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
