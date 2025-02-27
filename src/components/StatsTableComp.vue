<template>
  <div>
    <div class="d-flex gap-3 justify-content-between align-items-center border-top">
      <div class="d-flex align-items-end gap-2 py-2"><slot name="filters"></slot></div>
      <div class="d-flex align-items-end gap-2 justify-content-end py-2"><slot name="actions"></slot></div>
    </div>
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
          <template v-if="item.dnp === 1">-</template>
          <template v-else>
            {{
              item.gp && showAvg
                ? formatAvg(item.pts)
                : item.pts
            }}
          </template>
        </template>
        <template #ftm="{ value, item }">
          <template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #fta="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #ftprc="{ item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ formatPerc(item.ftprc) }}</template>
        </template>
        <template #fgm="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #fga="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #fgprc="{ item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ formatPerc(item.fgprc) }}</template>
        </template>
        <template #fg3m="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #fg3a="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #fg3prc="{ item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ formatPerc(item.fg3prc) }}</template>
        </template>
        <template #dreb="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #oreb="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #reb="{ item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else>
            {{
              showAvg ? formatAvg(item.reb) : item.reb
            }}</template
          >
        </template>
        <template #ast="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #stl="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #blk="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #blka="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #tov="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #fcm="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
        </template>
        <template #fdr="{ value, item }"
          ><template v-if="item.dnp === 1">-</template>
          <template v-else> {{ showAvg ? formatAvg(value) : value }}</template>
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
  </div>
</template>

<script setup lang="ts">
import { durationFormat } from '@/utils/dates'
import type { TableField } from '@/types/comp-table'
import TableComp from '@/components/TableComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import { computed } from 'vue'
import { getAvg, getPerc, formatAvg, formatPerc, getOrd } from '@/utils/maths'
import useLibs from '@/composable/useLibs'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useOptionsLib from '@/composable/useOptionsLib'
import type { CompetitionPlayerCalculatedStats, CompetitionPlayerStats } from '@/types/computed'
import { getPlayerCalculatedStatsFromPlayerGamesStats, playerStatsKeys } from '@/utils/stats/basketball'
const { t } = useI18n()

interface IProps {
  fields: TableField[]
  items: CompetitionPlayerStats[]
  limit?: number
  showLogo?: boolean
  showTotal?: boolean
  showAvg?: boolean
  sortedKey?: string | undefined
  sortedDirection?: 'asc' | 'desc' | undefined
}
const props = withDefaults(defineProps<IProps>(), {
  limit: 0,
  showTotal: false,
  showAvg: false,
  showLogo: false,
  sortedKey: undefined,
  sortedDirection: undefined
})



const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const { getTeamName, getPlayerName, getCompetition } = useLibs()
const { getCategory } = useOptionsLib()


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
  return props.items
    .map((item) => {
      const row: CompetitionPlayerCalculatedStats = {
        ...item,
        ...getPlayerCalculatedStatsFromPlayerGamesStats([item])
      }
      const length = row.gp as number || 1
      
      if (props.showAvg) {
        row.pts = getAvg(row.pts, length)
        playerStatsKeys
          .forEach((key) => {
            const total = (item[key] || 0) as number
            row[key] = getAvg(total, length)
          })
      }
      return row
    })
})
const footerItem = computed(() => {
  if (!props.showTotal) {
    return undefined
  }
  return  Array.isArray(props.items)
    ? getPlayerCalculatedStatsFromPlayerGamesStats(props.items)
    : undefined
})
</script>

<style scoped lang="scss"></style>
