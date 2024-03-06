<template>
  <ul class="list-group list-group-flush border-top border-bottom">
    <template v-if="!computedGames.length">
      <div class="list-group-item text-center text-body-secondary">No games.</div>
    </template>
    <template v-else>
      <template v-for="gameComputed in computedGames" :key="gameComputed.id">
        <RouterLink 
          class="list-group-item list-group-item-action game" 
          :to="gameComputed.to"
        >
          <template v-if="gameComputed.isFinished">
            <div class="date d-flex flex-column align-items-center justify-content-center lh-1">
              <span>{{ gameComputed.date?.short }}</span>
            </div>
          </template>
          <template v-for="(team, idx) in gameComputed.scores" :key="idx">
            <div class="team">
              <div class="name">
                <strong class="jersey-team fs-6 lh-1">{{ team.title }}</strong>
                <TeamLogo :team-id="team.id" :size="50" />
              </div>
              <template v-if="gameComputed.isFinished">
                <div
                  class="score border border-3 rounded-2"
                  :class="[team.winner ? 'border-win' : 'border-loss']"
                >
                  <strong class="jersey-score fs-3 lh-1 pt-1">{{ team.finalScore }}</strong>
                </div>
              </template>
            </div>

            <template v-if="idx === 0 && !gameComputed.isFinished">
              <div class="date d-flex flex-column align-items-center justify-content-center lh-1">
                <span>{{ gameComputed.date?.short }}</span>
                <small class="text-body-secondary">{{ gameComputed.date?.time }}</small>
              </div>
            </template>
          </template>
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
.game {
  display: flex;
  gap: 1rem;
  .team {
    flex: 1;
    display: flex;
    align-items: center;
    gap: .5rem;
    .name {
      flex-grow: 1;
      display: flex;
      align-items: center;
      justify-content: end;
      gap: .5rem;
    }
    .score {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 45px;
      height: 50px;
    }
  }
  .team ~ .team {
    flex-direction: row-reverse;
    .name {
      flex-direction: row-reverse;
      justify-content: start;
    }
  }
}
</style>
