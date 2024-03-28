<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
import TableComp from '@/components/TableComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs'
import type { ScoresComputed } from '@/models/GameComputed'
import type { TableField, TableItem } from '@/types/comp-table'
import type { GameDocScores } from '@/types/games'
import type { TeamId } from '@/types/teams'
import { add } from '@/utils/maths'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface IProps {
  periodIdx: number
  scores: GameDocScores
  nbPeriods: number
  isOtEnabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isOtEnabled: false
})

const emit = defineEmits(['change-period'])
const { getTeam } = useLibs()
const scoresComputed = computed(() =>
  Object.keys(props.scores).reduce((result: ScoresComputed[], teamId: TeamId) => {
    const team = getTeam(teamId)
    const obj = {
      ...team,
      finalScore: props.scores[teamId].reduce(add, 0),
      periods: props.scores[teamId]
    } as ScoresComputed
    result.push(obj)
    return result
  }, [])
)

const fields = computed((): TableField[] => {
  return [
    {
      key: 'id',
      label: t('global.team', 2)
    },
    ...scoresComputed.value[0].periods.map((n: number, idx: number) => ({
      key: `p${idx}`,
      label: `${
        idx < props.nbPeriods
          ? t('global.gameDetails.period.text')
          : t('global.gameDetails.ot.text')
      }${idx < props.nbPeriods ? idx + 1 : idx - props.nbPeriods + 1}`,
      thClass: `text-center ${idx === props.periodIdx && 'fw-bold'}`,
      tdClass: `text-end ${idx === props.periodIdx && 'text-bg-sorted-td'}`
    })),
    {
      key: 'finalScore',
      label: t('global.total'),
      thClass: 'fw-bold text-end',
      tdClass: 'fw-bold text-end'
    }
  ] as TableField[]
})

const items = computed(() => {
  return scoresComputed.value.map(
    (score: ScoresComputed): TableItem => ({
      id: getTeam(score.id),
      ...score.periods.reduce((acc: {}, n: number, idx: number) => {
        return {
          ...acc,
          [`p${idx}`]: n,
          finalScore: score.finalScore
        }
      }, {})
    })
  )
})

const handleJump = (n: 1 | -1) => {
  emit('change-period', n)
}
</script>
<template>
  <div class="hstack text-white bg-dark p-1">
    <div class="flex-grow-0 vstack gap-1">
      <TableComp class="mb-0" :fields="fields" :items="items" variant="dark">
        <template #id="{ value }">
          <div class="hstack gap-2">
          <TeamLogo :team-id="value.id" :size="25" />
          <span class="jersey-team text-uppercase">{{ value.short }}</span>
        </div>
        </template>
      </TableComp>
    </div>
    <div class="vstack">
      <div class="vstack justify-content-center align-items-center display-3 lh-1 font-scoreboard">
        {{
          t(
            `${
              periodIdx < props.nbPeriods
                ? 'global.gameDetails.period.text'
                : 'global.gameDetails.ot.text'
            }`
          )
        }}{{ periodIdx < nbPeriods ? periodIdx + 1 : periodIdx - nbPeriods + 1 }}
      </div>
      <div class="hstack gap-1 justify-content-center">
      <ButtonComp 
        :disabled="periodIdx <= 0"
        variant="primary" 
        size="lg"
        @click="() => handleJump(-1)" 
      ><i class="bi bi-rewind-fill"></i
      ></ButtonComp>
      <ButtonComp 
        variant="primary" 
        size="lg"
        :disabled="periodIdx >= nbPeriods - 1 && !isOtEnabled"
        @click="() => handleJump(1)" 
        ><i class="bi bi-fast-forward-fill"></i
      ></ButtonComp>
    </div>
    </div>
    
  </div>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
