import routes from '@/routes/index'
import FrontView from '@/cityhoops/views/IndexView.vue'
import CompetitionHomeView from '@/cityhoops/views/HomeView.vue'
import CompetitionStatsView from '@/cityhoops/views/StatsView.vue'
import CompetitionGamesView from '@/cityhoops/views/GamesView.vue'
import CompetitionTeamView from '@/cityhoops/views/TeamView.vue'
import CompetitionTeamsView from '@/cityhoops/views/TeamsView.vue'

import CompetitionGameDetailsView from '@/views/Competitions/GameDetailsView.vue'
import CompetitionPlayerDetailsView from '@/views/Competitions/PlayerDetailsView.vue'

const cityhoopsRoutes = routes.slice()

const frontViewIdx = cityhoopsRoutes.findIndex((r: any) => r.path === '/')
cityhoopsRoutes[frontViewIdx].component = FrontView

const frontViewChildren = frontViewIdx > -1 ? cityhoopsRoutes[frontViewIdx].children : undefined

if (frontViewChildren) {
  // remove competitions list
  const competitionsListIdx = frontViewChildren.findIndex((r: any) => r.name === 'home')
  if (competitionsListIdx > -1) {
    frontViewChildren[competitionsListIdx].redirect = { name: 'not-found' }
  }

  // replace competitions pages
  const competitionViewIdx = frontViewChildren.findIndex(
    (r: any) => r.path === '/competition/:competitionId'
  )
  const competitionViewChildren =
    competitionViewIdx > -1 ? frontViewChildren[competitionViewIdx]?.children : undefined

  if (Array.isArray(competitionViewChildren)) {
    frontViewChildren[competitionViewIdx].children = [
      {
        path: ':phase?/:group?',
        name: 'competition',
        component: CompetitionHomeView
      },
      {
        path: 'stats/:phase?/:group?',
        name: 'competition-stats',
        component: CompetitionStatsView
      },
      {
        path: 'games/:phase?/:group?',
        name: 'competition-games',
        component: CompetitionGamesView
      },
      {
        path: 'teams',
        name: 'competition-teams',
        component: CompetitionTeamsView
      },

      {
        path: 'game/:gameId',
        name: 'competition-game',
        component: CompetitionGameDetailsView
      },
      {
        path: 'team/:teamId',
        name: 'competition-team',
        component: CompetitionTeamView
      },
      {
        path: 'player/:playerId',
        name: 'competition-player',
        component: CompetitionPlayerDetailsView
      }
    ]
  }
}

export default cityhoopsRoutes
