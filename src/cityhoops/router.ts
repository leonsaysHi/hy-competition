import routes from '@/routes/index'
import FrontView from '@/cityhoops/views/IndexView.vue'
import CompetitionHomeView from '@/cityhoops/views/HomeView.vue'
import CompetitionRankingsView from '@/cityhoops/views/RankingsView.vue'
import CompetitionGamesView from '@/cityhoops/views/GamesView.vue'
import CompetitionTeamsView from '@/cityhoops/views/TeamsView.vue'
import BracketView from '@/cityhoops/views/BracketView.vue'
import CreateBracket from '@/cityhoops/views/brackets/CreateView.vue'
import ListBrackets from '@/cityhoops/views/brackets/ListView.vue'

import CompetitionGameDetailsView from '@/views/competition/GameDetailsView.vue'
import CompetitionTeamDetailsView from '@/views/competition/TeamDetailsView.vue'
import CompetitionPlayerDetailsView from '@/views/competition/PlayerDetailsView.vue'

const cityhoopsRoutes = routes.slice()

const frontViewIdx = cityhoopsRoutes.findIndex((r: any) => r.path === '/')
const competitionViewIdx = cityhoopsRoutes[frontViewIdx].children.findIndex(
  (r: any) => r.path === '/competition/:competitionId'
)

cityhoopsRoutes[frontViewIdx].component = FrontView
cityhoopsRoutes[frontViewIdx].children[competitionViewIdx].children = [
  {
    path: ':phase?/:group?',
    name: 'competition',
    component: CompetitionHomeView
  },
  {
    path: 'ranking/:phase?/:group?',
    name: 'competition-standing',
    component: CompetitionRankingsView
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
    component: CompetitionTeamDetailsView
  },
  {
    path: 'player/:playerId',
    name: 'competition-player',
    component: CompetitionPlayerDetailsView
  }
]

cityhoopsRoutes.push(
  {
    path: '/bracket',
    component: BracketView,
    children: [
      {
        path: '',
        name: 'bracket',
        component: CreateBracket
      },
      {
        path: 'list-YNZaQiwQDMPHCWsE1KrQ-brackets',
        name: 'bracket-list',
        component: ListBrackets
      }
    ]
  }
)

export default cityhoopsRoutes
