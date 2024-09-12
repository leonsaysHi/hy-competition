import type { Competition, Phase, PhaseGroup } from "@/types/competitions"
import type { Game } from "@/types/games"
import type { CompetitionPlayer, PlayerId } from "@/types/players"
import type { CompetitionTeam, Team, TeamId } from "@/types/teams"
import { compareAsc, isAfter } from "date-fns"
import GameComputedClass from "./GameComputed"


export default class GamesClass {
  rows: Game[]
  competition: Competition
  isFinished?: boolean
  isLive?: boolean
  phaseIdx?: number
  groupIdx?: number
  teamId?: TeamId

  constructor(competition: Competition, rows: Game[]) {
    this.competition = competition
    this.rows = rows
    this.phaseIdx = undefined
    this.groupIdx = undefined
    this.teamId = undefined
    this.isFinished = undefined
    this.isLive = undefined
  }

  phase(phaseIdx: number | undefined) {
    this.phaseIdx = phaseIdx
    return this
  }
  group(groupIdx: number | undefined) {
    if (this.phaseIdx === undefined) {
        console.warn('Should select phase first')
        return this
    }
    this.groupIdx = groupIdx
    if (this.groupIdx === undefined) {
        this.phaseIdx = undefined
    }
    return this
  }
  team(teamId: TeamId | undefined) {
    this.teamId = teamId
    return this
  }
  player(playerId: PlayerId) { // sets team
    const team = this.competition.teams.find((team: CompetitionTeam) => {
      return team.players.findIndex((player: CompetitionPlayer) => player.id === playerId) > -1
    })
    if (!team) {
      console.warn('unknown player')
      return this
    }
    return this.team(team.id)
  }
  finished(isFinished: boolean | undefined) {
    this.isFinished = isFinished
    return this
  }
  live(isLive: boolean | undefined) {
    this.isLive = isLive
    return this
  }

  getPhase():Phase | undefined {
    const { phaseIdx } = this
    const { phases } = this.competition
    return phaseIdx !== undefined 
        ? phases[phaseIdx] 
        : undefined
  }
  getGroup():PhaseGroup | undefined {
    const phase = this.getPhase()
    return phase !== undefined && this.groupIdx !== undefined 
        ? phase.groups[this.groupIdx]
        : undefined
  }

  get ():Game[] {
    const phase = this.getPhase()
    const group = this.getGroup()
    return this.competition.games
      .filter((game: Game) => {
        // isFinished | isLive
        const matchIsFinished = this.isFinished === undefined || game.isFinished === this.isFinished
        const matchIsLive = this.isLive === undefined || game.isLive === this.isLive
        // Phase
        const nextPhaseIdx = Number(this.phaseIdx) + 1 
        const nextPhase = this.phaseIdx !== undefined && this.competition.phases[nextPhaseIdx]
          ? this.competition.phases[nextPhaseIdx] 
          : undefined
        const dateStart = phase?.datetime
        const dateEnd = nextPhase?.datetime
        const matchPhaseDates = !dateStart || isAfter(game.datetime, dateStart) && 
          ( !dateEnd || isAfter(dateEnd, game.datetime))
        const matchPhase = !phase || matchPhaseDates
        // Group
        const matchGroup = !phase || !group || game.teams.every((teamId: TeamId) => group.teams.includes(teamId))
        // Team
        const matchTeam = !this.teamId || game.teams.includes(this.teamId)
        //
        return matchIsFinished && 
          matchIsLive && 
          matchPhase && 
          matchGroup && 
          matchTeam
      })
      .sort((a: Game, b: Game) => compareAsc(b.datetime, a.datetime))
  }

  getComputed ():GameComputedClass[] {
    return this
      .get()
      .map((game: Game) => new GameComputedClass(this.competition.id, game))
  }

}
