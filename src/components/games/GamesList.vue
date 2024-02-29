<template>
  <ul class="list-group list-group-flush border-top border-bottom">
    <template v-for="gameComputed in computedGames" :key="gameComputed.id">
      <RouterLink class="list-group-item list-group-item-action game" :to="gameComputed.to">
        <template v-for="(team, idx) in gameComputed.scores" :key="idx">
          <div class="team">
            <div class="name">
              <strong class="jersey-team">{{ team.title }}</strong>
              <TeamLogo :team-id="team.id" :size="54" />
            </div>
            <div
              class="score border border-3 rounded-2"
              :class="[team.winner ? 'border-win' : 'border-loss']"
            >
              <strong>{{ team.finalScore }}</strong>
            </div>
          </div>
        </template>
      </RouterLink>
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

const computedGames = computed<ComputedGame[]>(() =>
  props.items.map((game: Game) => new GameComputedClass(competitionId, game))
)
</script>
<style lang="scss" scoped>
.game {
  display: flex;
  gap: 1rem;
  .team {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    .name {
      flex-grow: 1;
      display: flex;
      align-items: center;
      justify-content: end;
      gap: 1rem;
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
