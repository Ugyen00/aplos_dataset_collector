import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Sentence = {
  id: number
  sentence: string
  char_count: number
  token_count: number
}

export type Recording = {
  id: string
  sentence_id: number
  speaker_name: string
  audio_url: string
  duration_ms: number
  created_at: string
}
