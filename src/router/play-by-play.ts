const adminRoutes = [
  {
    path: 'competition/:competitionId/game/:gameId',
    name: 'play-by-play',
    component: () => import('@/play-by-play/GameInput.vue')
  }
]

export default adminRoutes
