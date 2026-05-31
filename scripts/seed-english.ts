/**
 * Seeds English sentences into the `english_sentences` table in Supabase.
 *
 * Run: npx tsx scripts/seed-english.ts
 *
 * CSV format (data/english_sentences.csv):
 *   sentence,char_count,token_count
 *   "Hello world",11,2
 *   ...
 *
 * Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are set in .env.local before running.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load env manually (outside Next.js runtime)
const envPath = path.join(__dirname, '..', '.env.local')
const env = fs.readFileSync(envPath, 'utf-8')
for (const line of env.split('\n')) {
  const [key, ...val] = line.split('=')
  if (key && val.length) process.env[key.trim()] = val.join('=').trim()
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CSV_PATH = path.join(__dirname, '..', 'data', 'english_sentences.csv')

function parseCSV(content: string) {
  const lines = content.split('\n').filter(Boolean)
  const rows = []

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const cols: string[] = []
    let current = ''
    let inQuotes = false

    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        cols.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    cols.push(current)

    const sentence = cols[0]?.trim()
    if (sentence) {
      const charCount = cols[1] ? parseInt(cols[1]) : sentence.length
      const tokenCount = cols[2] ? parseInt(cols[2]) : sentence.split(/\s+/).length
      rows.push({
        sentence,
        char_count: isNaN(charCount) ? sentence.length : charCount,
        token_count: isNaN(tokenCount) ? sentence.split(/\s+/).length : tokenCount,
      })
    }
  }
  return rows
}

async function seed() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`\n❌ CSV not found at: ${CSV_PATH}`)
    console.error('Please add data/english_sentences.csv with columns: sentence,char_count,token_count\n')
    process.exit(1)
  }

  console.log('📖 Reading CSV...')
  const content = fs.readFileSync(CSV_PATH, 'utf-8').replace(/^\uFEFF/, '') // strip BOM
  const rows = parseCSV(content)
  console.log(`✅ Found ${rows.length} sentences`)

  // Insert in batches of 100
  const BATCH = 100
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from('english_sentences').insert(batch)
    if (error) {
      console.error(`❌ Batch ${i}–${i + BATCH} failed:`, error.message)
    } else {
      inserted += batch.length
      console.log(`  Inserted ${inserted}/${rows.length}`)
    }
  }
  console.log('\n🎉 Done! English sentences are ready for Kurtap & Tshangla recording.')
}

seed().catch(console.error)
