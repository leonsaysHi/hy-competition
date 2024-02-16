// symbols.ts
import type { InjectionKey, Ref } from 'vue'
import type { Competition } from '@/types/competitions'
import type { Game } from '@/types/games'

export const CompetitionsLibKey = Symbol() as InjectionKey<Ref<Competition[] | undefined>>
export const CompetitionKey = Symbol() as InjectionKey<Ref<Competition>>
export const GamesKey = Symbol() as InjectionKey<Ref<Game[] | undefined>>
