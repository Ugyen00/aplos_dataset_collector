import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const speaker = searchParams.get('speaker') || ''

  // Get sentence IDs already recorded by this speaker in Tshangla
  const { data: recorded } = await supabase
    .from('tshangla_recordings')
    .select('sentence_id')
    .eq('speaker_name', speaker)

  const recordedIds = (recorded || []).map((r: { sentence_id: number }) => r.sentence_id)

  let query = supabase
    .from('english_sentences')
    .select('id, sentence, char_count, token_count')
    .order('id', { ascending: true })
    .limit(1)

  if (recordedIds.length > 0) {
    query = query.not('id', 'in', `(${recordedIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data || data.length === 0) {
    return NextResponse.json({ done: true, message: 'All sentences recorded!' })
  }

  return NextResponse.json({ sentence: data[0] })
}
