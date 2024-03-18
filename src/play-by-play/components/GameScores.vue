<script lang="ts" setup>
import { add } from '@/utils/maths'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import { computed } from 'vue'
import type { GameDocScores } from '@/types/games'
import type { Team, TeamId } from '@/types/teams'
import useLibs from '@/composable/useLibs'

interface IProps {
  scores: GameDocScores
}

const props = withDefaults(defineProps<IProps>(), {})

const { getTeam } = useLibs()
const teamsScores = computed<(Team & { score: number })[] | undefined>(() =>
  props.scores
    ? Object.keys(props.scores).map((teamId: TeamId) => {
        return {
          ...getTeam(teamId),
          score: props.scores[teamId].reduce(add, 0)
        }
      })
    : undefined
)
</script>
<template>
  <div class="hstack gap-1">
    <template v-if="teamsScores">
      <template v-for="(team, idx) in teamsScores" :key="team.id">
        <div class="hstack gap-1" :class="idx === 0 && 'flex-row-reverse'">
          <template v-if="idx === 0"><span>-</span></template>
          <strong class="h3 mb-0 font-scoreboard">{{ team.score }}</strong>
          <TeamLogo :team-id="team.id" :size="35" />
          <span class="jersey-team">{{ team.short }}</span>
        </div>
      </template>
    </template>
  </div>
</template>
