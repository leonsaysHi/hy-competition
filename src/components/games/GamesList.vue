<template>
  <ul class="list-group list-group-flush border-top border-bottom">
    <template v-if="!items.length">
      <div class="list-group-item text-center text-body-secondary">No games.</div>
    </template>
    <template v-else>
      <template v-for="gameComputed in sortedItems" :key="gameComputed.id">
        <RouterLink
          class="hstack gap-2 list-group-item list-group-item-action lh-1"
          :to="gameComputed.to"
        >
          <div class="team vstack align-items-center">
            <strong class="font-team fs-6 lh-1">{{ gameComputed.scores[0].title }}</strong>
            <TeamLogo :team-id="gameComputed.scores[0].id" :size="45" />
          </div>

          <div class="">
            <template v-if="gameComputed.isLive">
              <div class="vstack gap-1">
                <div class="text-success text-center">{{ t('global.gameDetails.live') }}</div>
                <div class="hstack gap-2 justify-content-center">
                  <template v-for="(team, idx) in gameComputed.scores" :key="idx">
                    <div
                      class="flex-grow-1 p-2 border border-3 rounded-2"
                      :class="[team.winner ? 'border-win' : 'border-loss']"
                    >
                      <strong class="font-score fs-3 lh-1 pt-1">{{ team.finalScore }}</strong>
                    </div>
                    <template v-if="idx === 0">
                      <SpinnerComp grow variant="success" size="sm" />
                    </template>
                  </template>
                </div>
              </div>
            </template>

            <template v-else-if="gameComputed.isFinished">
              <div class="vstack gap-1">
                <small class="text-center text-body-secondary">{{
                  gameComputed.date?.short
                }}</small>
                <div class="hstack gap-2 justify-content-center">
                  <template v-for="(team, idx) in gameComputed.scores" :key="idx">
                    <div
                      class="flex-grow-1 p-2 border border-3 rounded-2"
                      :class="[team.winner ? 'border-win' : 'border-loss']"
                    >
                      <strong class="font-score fs-3 lh-1 pt-1">{{ team.finalScore }}</strong>
                    </div>
                  </template>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="vstack gap-1 align-items-center justify-content-center">
                <strong>{{ gameComputed.date?.long }}</strong>
                <small class="text-body-secondary">{{ gameComputed.date?.time }}</small>
              </div>
            </template>
          </div>

          <div class="team vstack align-items-center">
            <strong class="font-team fs-6">{{ gameComputed.scores[1].title }}</strong>
            <TeamLogo :team-id="gameComputed.scores[1].id" :size="45" />
          </div>
        </RouterLink>
      </template>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import TeamLogo from '@/components/teams/TeamLogo.vue'
import GameComputedClass from '@/models/GameComputed'
import SpinnerComp from '../SpinnerComp.vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue';
const { t } = useI18n()
interface IProps {
  items: GameComputedClass[]
}
const props = withDefaults(defineProps<IProps>(), {})
const sortedItems = computed(() => {
  const result = props.items.slice()
  result.reverse()
  return result
})
</script>
<style lang="scss" scoped>
.team {
  flex: 1;
}
</style>
