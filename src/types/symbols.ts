// symbols.ts
import type { InjectionKey, Ref } from 'vue'
import type { Competition } from '@/types/competitions'
import type { Game } from '@/types/games'
import type { Player } from '@/types/players'
import type { Team } from '@/types/teams'

export const PlayersKey = Symbol() as InjectionKey<Ref<Player[] | undefined>>
export const TeamsKey = Symbol() as InjectionKey<Ref<Team[] | undefined>>
export const CompetitionKey = Symbol() as InjectionKey<Ref<Competition | undefined>>
export const GamesKey = Symbol() as InjectionKey<Ref<Game[] | undefined>>
