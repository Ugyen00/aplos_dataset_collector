import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('audio') as File
  const speaker = formData.get('speaker') as string
  const sentenceId = formData.get('sentence_id') as string

  if (!file || !speaker || !sentenceId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const ext = file.type === 'audio/webm' ? 'webm' : 'wav'
  const filename = `${speaker}/${sentenceId}_${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from('recordings')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabase.storage
    .from('recordings')
    .getPublicUrl(filename)

  return NextResponse.json({ url: urlData.publicUrl, path: filename })
}
