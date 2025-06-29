import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      reasons: {
        Row: {
          id: number
          title: string
          description: string
          image: string
          song: string
          audio_file: string
          order_index: number
          preload_offset: number
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          image: string
          song: string
          audio_file: string
          order_index: number
          preload_offset?: number
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          image?: string
          song?: string
          audio_file?: string
          order_index?: number
          preload_offset?: number
          created_at?: string
        }
      }
      audio_cache: {
        Row: {
          id: number
          audio_file: string
          is_loaded: boolean
          load_time: number
          created_at: string
        }
        Insert: {
          id?: number
          audio_file: string
          is_loaded?: boolean
          load_time?: number
          created_at?: string
        }
        Update: {
          id?: number
          audio_file?: string
          is_loaded?: boolean
          load_time?: number
          created_at?: string
        }
      }
    }
  }
}