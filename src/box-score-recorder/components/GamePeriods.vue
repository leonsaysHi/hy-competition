<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
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
      key: 'team',
      label: ''
    },
    ...scoresComputed.value[0].periods.map((n: number, idx: number) => ({
      key: `p${idx}`,
      pIdx: idx,
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
      team: getTeam(score.id),
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

const handleJumpTo = (idx: number) => {
  emit('change-period', idx)
}
</script>
<template>
  <div class="d-flex justify-content-center text-white bg-dark p-1">
    <div>
      <table class="table table-sm table-dark">
        <thead class="align-middle">
          <template v-for="({ label, key, pIdx }, hIdx) in fields" :key="hIdx">
            <template v-if="key === 'team'">
              <th class="pe-3">{{ label }}</th>
            </template>
            <template v-else-if="key === 'finalScore'">
              <th>
                <div>
                  <ButtonComp
                    variant="outline-primary"
                    size="sm"
                    :disabled="periodIdx + 1 <= nbPeriods - 1 || !isOtEnabled"
                    @click="handleJumpTo(periodIdx + 1)"
                    >+</ButtonComp
                  >
                </div>
              </th>
              <th class="fw-bold text-end ps-3">{{ label }}</th>
            </template>
            <template v-else>
              <th>
                <div>
                  <ButtonComp
                    :variant="periodIdx === pIdx ? 'primary' : 'outline-primary'"
                    size="sm"
                    @click="handleJumpTo(pIdx)"
                    >{{ label }}</ButtonComp
                  >
                </div>
              </th>
            </template>
          </template>
        </thead>
        <tbody>
          <template v-for="(item, trIdx) in items" :key="trIdx">
            <tr>
              <template v-for="({ key }, tdIdx) in fields" :key="tdIdx">
                <template v-if="key === 'team'">
                  <div class="hstack gap-2 pe-3">
                    <TeamLogo :team-id="item[key].id" :size="30" />
                    <span class="jersey-team">{{ item[key].short }}</span>
                  </div>
                </template>
                <template v-else-if="key === 'finalScore'">
                  <td class="fw-bold text-center">-</td>
                  <td class="fw-bold text-end ps-3">{{ item[key] }}</td>
                </template>
                <template v-else>
                  <td class="text-end pe-3">{{ item[key] }}</td>
                </template>
              </template>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
