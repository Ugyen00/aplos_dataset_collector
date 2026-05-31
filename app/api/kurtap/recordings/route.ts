import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { sentence_id, speaker_name, translated_text, audio_url, duration_ms } = await req.json()

  if (!sentence_id || !speaker_name || !translated_text || !audio_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('kurtap_recordings')
    .insert({ sentence_id, speaker_name, translated_text, audio_url, duration_ms })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ recording: data })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const speaker = searchParams.get('speaker')

  let query = supabase
    .from('kurtap_recordings')
    .select('*, english_sentences(sentence)')
    .order('created_at', { ascending: false })

  if (speaker) query = query.eq('speaker_name', speaker)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ recordings: data })
}
