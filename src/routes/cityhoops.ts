import routes from './index'

import CompetitionHomeView from '@/cityhoops/views/HomeView.vue'
import CompetitionRankingsView from '@/cityhoops/views/RankingsView.vue'
import CompetitionGamesView from '@/cityhoops/views/GamesView.vue'

import CompetitionGameDetailsView from '@/views/competition/GameDetailsView.vue'
import CompetitionTeamDetailsView from '@/views/competition/TeamDetailsView.vue'
import CompetitionPlayerDetailsView from '@/views/competition/PlayerDetailsView.vue'

const frontViewIdx = routes.findIndex((r: any) => r.path === '/')
const competitionViewIdx = routes[frontViewIdx].children.findIndex(
  (r: any) => r.path === '/competition/:competitionId'
)

const cityhoopsRoutes = routes.slice()
cityhoopsRoutes[frontViewIdx].children[competitionViewIdx].children = [
  {
    path: ':phase?',
    name: 'competition',
    component: CompetitionHomeView
  },
  {
    path: 'ranking/:phase?',
    name: 'competition-standing',
    component: CompetitionRankingsView
  },
  {
    path: 'games/:phase?',
    name: 'competition-games',
    component: CompetitionGamesView
  },

  {
    path: 'game/:gameId',
    name: 'competition-game',
    component: CompetitionGameDetailsView
  },
  {
    path: 'team/:teamId',
    name: 'competition-team',
    component: CompetitionTeamDetailsView
  },
  {
    path: 'player/:playerId',
    name: 'competition-player',
    component: CompetitionPlayerDetailsView
  }
]

export default cityhoopsRoutes
