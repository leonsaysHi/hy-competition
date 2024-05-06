import routes from '@/routes/index'
import FrontView from '@/cityhoops/views/IndexView.vue'
import CompetitionHomeView from '@/cityhoops/views/HomeView.vue'
import CompetitionRankingsView from '@/cityhoops/views/RankingsView.vue'
import CompetitionGamesView from '@/cityhoops/views/GamesView.vue'
import CompetitionTeamsView from '@/cityhoops/views/TeamsView.vue'
import BracketView from '@/cityhoops/views/BracketView.vue'
import CreateBracket from '@/cityhoops/views/brackets/CreateView.vue'
import ViewBracket from '@/cityhoops/views/brackets/ViewView.vue'
import ListBrackets from '@/cityhoops/views/brackets/ListView.vue'
import AdminBrackets from '@/cityhoops/views/brackets/AdminView.vue'

import CompetitionGameDetailsView from '@/views/competition/GameDetailsView.vue'
import CompetitionTeamDetailsView from '@/views/competition/TeamDetailsView.vue'
import CompetitionPlayerDetailsView from '@/views/competition/PlayerDetailsView.vue'

const cityhoopsRoutes = routes.slice()

const frontViewIdx = cityhoopsRoutes.findIndex((r: any) => r.path === '/')
cityhoopsRoutes[frontViewIdx].component = FrontView

const frontViewChildren = frontViewIdx > -1 ? cityhoopsRoutes[frontViewIdx].children : undefined

if (frontViewChildren) {
  // remove compatitions list
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
  }
}

cityhoopsRoutes.push({
  path: '/brackets',
  component: BracketView,
  children: [
    {
      path: '',
      name: 'bracket-new',
      component: CreateBracket
    },
    {
      path: 'list',
      name: 'bracket-list',
      component: ListBrackets
    },
    {
      path: 'view/:bracketId',
      name: 'bracket-view',
      component: ViewBracket
    },
    {
      path: 'admin-comp-brackets/:competitionId',
      name: 'bracket-admin',
      meta: {
        authRequired: ['admin']
      },
      component: AdminBrackets
    }
  ]
})

export default cityhoopsRoutes
