<template>
  <ul class="list-group list-group-flush border-top border-bottom">
    <template v-if="!computedGames.length">
      <div class="list-group-item text-center text-body-secondary">No games.</div>
    </template>
    <template v-else>
      <template v-for="gameComputed in computedGames" :key="gameComputed.id">
        <RouterLink
          class="hstack gap-2 list-group-item list-group-item-action lh-1"
          :to="gameComputed.to"
        >
          <div class="team vstack align-items-center">
            <strong class="jersey-team fs-6 lh-1">{{ gameComputed.scores[0].title }}</strong>
            <TeamLogo :team-id="gameComputed.scores[0].id" :size="45" />
          </div>

          <div class="">
          <template v-if="gameComputed.isFinished">
            <div class="vstack gap-1">
              <small class="text-center text-body-secondary">{{ gameComputed.date?.short }}</small>
              <div class="hstack gap-2 justify-content-center">
                <template v-for="(team, idx) in gameComputed.scores" :key="idx">
                  <div
                    class="flex-grow-1 p-2 border border-3 rounded-2"
                    :class="[team.winner ? 'border-win' : 'border-loss']"
                  >
                    <strong class="jersey-score fs-3 lh-1 pt-1">{{ team.finalScore }}</strong>
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
            <strong class="jersey-team fs-6">{{ gameComputed.scores[1].title }}</strong>
            <TeamLogo :team-id="gameComputed.scores[1].id" :size="45" />
          </div>
        </RouterLink>
      </template>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import TeamLogo from '@/components/teams/TeamLogo.vue'
import type ComputedGame from '@/models/GameComputed'
import GameComputedClass from '@/models/GameComputed'
import type { Game } from '@/types/games'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params

interface IProps {
  items: Game[]
}
const props = withDefaults(defineProps<IProps>(), {})

const computedGames = computed<ComputedGame[]>(() => {
  return props.items.map((game: Game) => new GameComputedClass(competitionId, game))
})
</script>
<style lang="scss" scoped>
  .team {
    flex: 1;
  }
</style>
