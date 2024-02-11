import type { Competition } from "@/types/competitions"
import type { Game } from "@/types/games"
import type { CompetitionPlayerComputed, Player } from "@/types/players"
import type { CompetitionTeam, CompetitionTeamComputed, Team } from "@/types/teams"


export default class CompetitionClass {
    row: Competition
    games: Game[]
    teams: CompetitionTeam[]
    playersLib: Player[]
    teamsLib: Team[]

    constructor(
        row: Competition, 
        teams: CompetitionTeam[],
        games: Game[],
        libs: { teams: Team[], players: Player[]} ,
    ) {
        this.row = row
        this.games = games
        this.teams = teams
        this.playersLib = libs.players
        this.teamsLib = libs.teams
    }

    get teamsComputed(): CompetitionTeamComputed[] {
        return []
        /* Object.keys(this.row.teams)
            .reduce((acc, teamId) => {
                const teamObj = this.row.teams[teamId]
                const team = this.teams.find((row: Team) => row.id === teamId)
                const roster = teamObj.roster
                    .map((playerId: PlayerId) => {
                        this.players.find((row: Player) => row.id === playerId)
                    })
                return {
                    ...acc,
                    [teamId]: {
                        team,
                        roster,
                    }
                }
            }, {})
        */
    }
    get playersComputed(): CompetitionPlayerComputed[] {
        return []
        /* O
        bject.keys(this.row.teams)
            .reduce((acc, teamId) => {
                const teamObj = this.row.teams[teamId]
                const team = this.teams.find((row: Team) => row.id === teamId)
                const roster = teamObj.roster
                    .map((playerId: PlayerId) => {
                        this.players.find((row: Player) => row.id === playerId)
                    })
                return {
                    ...acc,
                    [teamId]: {
                        team,
                        roster,
                    }
                }
            }, {})
        */
    }
}
