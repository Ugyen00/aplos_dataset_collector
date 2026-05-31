import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const skipIdsParam = searchParams.get('skip_ids') || ''

  // Exclude sentences recorded by ANY speaker to prevent cross-user repeats
  const { data: recorded } = await supabase
    .from('kurtap_recordings')
    .select('sentence_id')

  const recordedIds = (recorded || []).map((r: { sentence_id: number }) => r.sentence_id)

  const skipIds = skipIdsParam
    ? skipIdsParam.split(',').map(Number).filter((n) => !isNaN(n) && n > 0)
    : []

  const excludeIds = [...new Set([...recordedIds, ...skipIds])]

  // Get count of eligible sentences for random selection
  let countQuery = supabase.from('english_sentences').select('*', { count: 'exact', head: true })
  if (excludeIds.length > 0) {
    countQuery = countQuery.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { count, error: countError } = await countQuery
  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })
  if (!count || count === 0) {
    return NextResponse.json({ done: true, message: 'All sentences recorded!' })
  }

  const randomOffset = Math.floor(Math.random() * count)

  let query = supabase
    .from('english_sentences')
    .select('id, sentence, char_count, token_count')
    .order('id', { ascending: true })
    .range(randomOffset, randomOffset)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data || data.length === 0) {
    return NextResponse.json({ done: true, message: 'All sentences recorded!' })
  }

  return NextResponse.json({ sentence: data[0] })
}
