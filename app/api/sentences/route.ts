import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const speaker = searchParams.get('speaker') || ''
  const after = searchParams.get('after') // sentence id to get next after

  // Get a sentence that this speaker hasn't recorded yet
  // Strategy: find recorded sentence IDs by this speaker, then get one that's not in that set
  const { data: recorded } = await supabase
    .from('recordings')
    .select('sentence_id')
    .eq('speaker_name', speaker)

  const recordedIds = (recorded || []).map((r: { sentence_id: number }) => r.sentence_id)

  let query = supabase
    .from('sentences')
    .select('id, sentence, char_count, token_count')
    .order('id', { ascending: true })
    .limit(1)

  if (recordedIds.length > 0) {
    query = query.not('id', 'in', `(${recordedIds.join(',')})`)
  }

  if (after) {
    query = query.gt('id', parseInt(after))
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data || data.length === 0) {
    return NextResponse.json({ done: true, message: 'All sentences recorded!' })
  }

  return NextResponse.json({ sentence: data[0] })
}

export async function POST(req: NextRequest) {
  // Get specific sentence by ID
  const { id } = await req.json()
  const { data, error } = await supabase
    .from('sentences')
    .select('id, sentence, char_count, token_count')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sentence: data })
}
