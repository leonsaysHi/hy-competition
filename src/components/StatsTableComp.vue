<template>
  <div class="w-100 overflow-x-auto">
    <TableComp
      :fields="fields"
      :items="computedItems"
      :limit="limit"
      :footer="footerItem"
      :sorted-key="sortedKey"
      :sorted-direction="sortedDirection"
      small
      showEmpty
    >
      <template #isWin="{ value }">
        <strong :class="[value ? 'text-win' : 'text-loss', 'fs-5']">{{ value ? 'W' : 'L' }}</strong>
      </template>
      <template #teamId="{ value }">
        <div class="d-flex gap-2 align-items-center lh-1">
          <template v-if="showLogo">
            <TeamLogo :team-id="value" :size="35" class="flex-shrink-0" />
          </template>
          <span class="font-team py-1">{{ getTeamName(value) }}</span>
        </div>
      </template>
      <template #competitionId="{ value }">
        <RouterLink
          class="d-flex flex-column align-items-start text-decoration-none"
          :to="{ name: 'competition', params: { competitionId: value } }"
        >
          <div>{{ getCompetition(value)?.title }}</div>
          <div class="d-flex gap-3 small text-body-secondary text-nowrap">
            <small>{{ getCompetition(value)?.date }}</small>
            <small>{{ getCategory(getCompetition(value)?.category)?.text }}</small>
          </div>
        </RouterLink>
      </template>
      <template #number="{ value }"
        ><span class="text-body-secondary font-number fs-6 lh-small">{{ value }}</span></template
      >
      <template #id="{ value }"
        ><RouterLink
          class="d-flex align-items-center gap-2 link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover font-name lh-small"
          :to="{
            name: 'competition-player',
            params: { competitionId: competitionId, playerId: value }
          }"
        >
          {{ getPlayerName(value) }}
        </RouterLink></template
      >
      <template #pos="{ index }"
        >{{ index + 1 }}<sup>{{ getOrd(index + 1) }}</sup></template
      >
      <template #gp="{ value }">
        {{ value }}
      </template>
      <template #pts="{ item }">
        <template v-if="item.dnp === true">-</template>
        <template v-else>
          {{
            item.gp && !showCumul
              ? formatAvg(item.pts)
              : item.pts
          }}
        </template>
      </template>
      <template #ftm="{ value, item }">
        <template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #fta="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #ftprc="{ item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ formatPerc(getCalculated(item).ftprc) }}</template>
      </template>
      <template #fgm="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #fga="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #fgprc="{ item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ formatPerc(getCalculated(item).fgprc) }}</template>
      </template>
      <template #fg3m="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #fg3a="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #fg3prc="{ item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ formatPerc(getCalculated(item).fg3prc) }}</template>
      </template>
      <template #dreb="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #oreb="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #reb="{ item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else>
          {{
            item.gp && !showCumul ? formatAvg(value) : getCalculated(item).reb
          }}</template
        >
      </template>
      <template #ast="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #stl="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #blk="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #blka="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #tov="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #fcm="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #fdr="{ value, item }"
        ><template v-if="item.dnp === true">-</template>
        <template v-else> {{ item.gp && !showCumul ? formatAvg(value) : value }}</template>
      </template>
      <template #footerid>
        <span class="fw-lighter">{{ t('global.total', 2) }}</span>
      </template>
      <template #footertime="{ value }">
        {{ durationFormat(value) }}
      </template>
      <template #footerftprc>
        {{ formatPerc(getCalculated(footerItem).ftprc) }}
      </template>
      <template #footerfgprc>
        {{ formatPerc(getCalculated(footerItem).fgprc) }}
      </template>
      <template #footerfg3prc>
        {{ formatPerc(getCalculated(footerItem).fg3prc) }}
      </template>
      <template #footerpts>
        {{ footerItem.ftm + 2 * footerItem.fgm + 3 * footerItem.fg3m }}
      </template>
      <template #footerreb>
        {{ footerItem.oreb + footerItem.dreb }}
      </template>
    </TableComp>
  </div>
</template>

<script setup lang="ts">
import { durationFormat } from '@/utils/dates'
import type { TableField, TableItem } from '@/types/comp-table'
import type { Option } from '@/types/comp-fields'
import TableComp from '@/components/TableComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import { computed } from 'vue'
import { getAvg, getPerc, formatAvg, formatPerc, getOrd } from '@/utils/maths'
import useLibs from '@/composable/useLibs'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useOptionsLib from '@/composable/useOptionsLib'
import type { PlayerStatKey } from '@/types/stats'
const { t } = useI18n()

interface IProps {
  fields: TableField[]
  items: TableItem[]
  showAvg?: boolean
  limit?: number
  showCumul?: boolean
  showLogo?: boolean
  showTotal?: boolean
  sortedKey?: string | undefined
  sortedDirection?: 'asc' | 'desc' | undefined
}
const props = withDefaults(defineProps<IProps>(), {
  limit: 0,
  showCumul: false,
  showTotal: false,
  showLogo: false,
  sortedKey: undefined,
  sortedDirection: undefined
})

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const { getTeamName, getPlayerName, getCompetition } = useLibs()
const { playerStatsKeys, playerRankingKeys, getCategory } = useOptionsLib()
const getCalculated = (item) => {
  const { fta, ftm, fga, fgm, fg3a, fg3m, oreb, dreb } = item
  const ftprc = getPerc(fta, ftm)
  const fgprc = getPerc(fga, fgm)
  const fg3prc = getPerc(fg3a, fg3m)
  const pts = ftm + 2 * fgm + 3 * fg3m
  const reb = oreb + dreb
  return {
    ftprc,
    fgprc,
    fg3prc,
    pts,
    reb
  }
}
const computedItems = computed(() => {
  const statKeys: PlayerStatKey[] = playerStatsKeys.map((opt: Option) => opt.value as PlayerStatKey)
  return props.items
    .map((item) => {
      const length = item.gp as number || 1
      const calculated = getCalculated(item)
      item.pts = calculated.pts
      if (!props.showCumul || length < 2) {
        item.pts = getAvg(item.pts, length)
        statKeys
          .forEach((key) => {
              const total = (item[key] || 0) as number
              item[key] = getAvg(total, length)
          })
      } else {
        item.pts = item.ftm + 2 * item.fgm + 3 * item.fg3m
      }
      return item
    })
})
const footerItem = computed(() => {
  if (!props.showTotal) {
    return undefined
  }
  return Object.keys(props.items[0]).reduce(
    (result: {}, key: string) => {
      if (playerRankingKeys.findIndex((opt: Option) => opt.value === key) === -1) {
        result[key] = ''
      } else {
        result[key] = props.items.reduce((tot: number, item) => tot + Number(item[key]), 0)
      }
      return result
    },
    {} as {}
  )
})
</script>

<style scoped lang="scss"></style>
