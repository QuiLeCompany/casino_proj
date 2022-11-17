export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          id: number
          name: string | null
          iso2: string
          iso3: string | null
          local_name: string | null
          continent: Database["public"]["Enums"]["continents"] | null
        }
        Insert: {
          id?: number
          name?: string | null
          iso2: string
          iso3?: string | null
          local_name?: string | null
          continent?: Database["public"]["Enums"]["continents"] | null
        }
        Update: {
          id?: number
          name?: string | null
          iso2?: string
          iso3?: string | null
          local_name?: string | null
          continent?: Database["public"]["Enums"]["continents"] | null
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      todos: {
        Row: {
          id: number
          user_id: string
          task: string | null
          is_complete: boolean | null
          inserted_at: string
        }
        Insert: {
          id?: number
          user_id: string
          task?: string | null
          is_complete?: boolean | null
          inserted_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          task?: string | null
          is_complete?: boolean | null
          inserted_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      continents:
        | "Africa"
        | "Antarctica"
        | "Asia"
        | "Europe"
        | "Oceania"
        | "North America"
        | "South America"
    }
  }
}
