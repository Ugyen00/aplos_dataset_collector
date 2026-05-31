/**
 * Run: npx ts-node --esm scripts/seed.ts
 * Or:  node --loader ts-node/esm scripts/seed.ts
 *
 * Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are set in .env.local before running.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load env manually since we're outside Next.js runtime
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

const CSV_PATH = path.join(__dirname, '..', 'data', 'dzongkha_sentences.csv')

function parseCSV(content: string) {
  const lines = content.split('\n').filter(Boolean)
  const header = lines[0].split(',')
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    // Handle quoted fields with commas inside
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
    if (cols[0]?.trim()) {
      rows.push({
        sentence: cols[0].trim(),
        char_count: parseInt(cols[1]) || 0,
        token_count: parseInt(cols[2]) || 0,
      })
    }
  }
  return rows
}

async function seed() {
  console.log('Reading CSV...')
  const content = fs.readFileSync(CSV_PATH, 'utf-8').replace(/^\uFEFF/, '') // strip BOM
  const rows = parseCSV(content)
  console.log(`Found ${rows.length} sentences`)

  // Insert in batches of 100
  const BATCH = 100
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from('sentences').insert(batch)
    if (error) {
      console.error(`Batch ${i}-${i + BATCH} failed:`, error.message)
    } else {
      inserted += batch.length
      console.log(`Inserted ${inserted}/${rows.length}`)
    }
  }
  console.log('Done!')
}

seed().catch(console.error)
