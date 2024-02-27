<template>
  <ul class="list-group list-group-flush border-top border-bottom">
    <template v-for="gameComputed in items" :key="gameComputed.id">
      <RouterLink class="list-group-item list-group-item-action game" :to="gameComputed.to">
        <template v-for="(team, idx) in gameComputed.scores" :key="idx">
          <div class="team">
            <div class="name">
              <strong>{{ team.title }}</strong>
              <Logo :team-id="team.id" :size="54" />
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
import type { Game } from '@/types/games'
import { computed } from 'vue'
import GameComputed from '@/models/GameComputed'
import { useRoute } from 'vue-router'
import Logo from '../teams/Logo.vue'

const route = useRoute()
const { competitionId } = route.params

interface IProps {
  games: Game[]
}
const props = withDefaults(defineProps<IProps>(), {})
const items = computed(() => {
  return props.games.map((game: Game) => {
    return new GameComputed(competitionId, game)
  })
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
