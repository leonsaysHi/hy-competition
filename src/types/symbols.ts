// symbols.ts
import type { InjectionKey, Ref } from 'vue'
import type { Competition } from '@/types/competitions'
import type { Game } from '@/types/games'
import type { Player } from '@/types/players'
import type { Team } from '@/types/teams'

export const PlayersLibKey = Symbol() as InjectionKey<Ref<Player[] | undefined>>
export const TeamsLibKey = Symbol() as InjectionKey<Ref<Team[] | undefined>>
export const CompetitionsLibKey = Symbol() as InjectionKey<Ref<Competition[] | undefined>>
export const CompetitionKey = Symbol() as InjectionKey<Ref<Competition>>
export const GamesKey = Symbol() as InjectionKey<Ref<Game[] | undefined>>
