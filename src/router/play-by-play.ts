const adminRoutes = [
  {
    path: 'competition/:competitionId/game/:gameId',
    name: 'play-by-play',
    component: () => import('@/play-by-play/Game.vue')
  }
]

export default adminRoutes
