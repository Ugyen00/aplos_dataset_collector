'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { bufferToWav } from '@/lib/wav-helper'

type Sentence = {
  id: number
  sentence: string
  char_count: number
  token_count: number
}

type Phase = 'idle' | 'recording' | 'review' | 'saving' | 'saved'

function LanguageSelector({ onSelectDzongkha }: { onSelectDzongkha: () => void }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="text-3xl">🇧🇹</span>
            <span className="text-2xl font-bold text-white tracking-tight font-sans">
              Aplos Lab TTS
            </span>
          </div>
          <p className="text-neutral-500 text-sm">Voice Recording Platform · Choose your language track</p>
        </div>

        <div className="grid gap-4">
          {/* Dzongkha */}
          <button
            onClick={onSelectDzongkha}
            className="group w-full bg-[#121212] hover:bg-[#161616] border border-[#222222] hover:border-neutral-500 rounded-xl p-6 text-left transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-[#222222] flex items-center justify-center text-xl flex-shrink-0">🇧🇹</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-base">Dzongkha</h3>
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-medium uppercase tracking-wider">TTS Record</span>
                </div>
                <p className="text-neutral-500 text-sm">Read Dzongkha sentences aloud · 1,983 sentences</p>
              </div>
              <div className="w-8 h-8 rounded-full border border-neutral-700 group-hover:border-white bg-transparent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Kurtap */}
          <Link href="/kurtap" className="group block">
            <div className="w-full bg-[#121212] hover:bg-[#161616] border border-[#222222] hover:border-neutral-500 rounded-xl p-6 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-[#222222] flex items-center justify-center text-xl flex-shrink-0">🗣️</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-base">Kurtap</h3>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-medium uppercase tracking-wider">Translate + Record</span>
                  </div>
                  <p className="text-neutral-500 text-sm">Translate English sentences into Kurtap, then record your voice</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-neutral-700 group-hover:border-white bg-transparent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Tshangla */}
          <Link href="/tshangla" className="group block">
            <div className="w-full bg-[#121212] hover:bg-[#161616] border border-[#222222] hover:border-neutral-500 rounded-xl p-6 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-[#222222] flex items-center justify-center text-xl flex-shrink-0">🗣️</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-base">Tshangla</h3>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-medium uppercase tracking-wider">Translate + Record</span>
                  </div>
                  <p className="text-neutral-500 text-sm">Translate English sentences into Tshangla, then record your voice</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-neutral-700 group-hover:border-white bg-transparent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <p className="text-center text-neutral-700 text-xs mt-8">Aplos Lab · Bhutan Language Dataset Collection</p>
      </div>
    </div>
  )
}

export default function RecorderPage() {
  const [showSelector, setShowSelector] = useState(true)
  const [speaker, setSpeaker] = useState('')
  const [speakerInput, setSpeakerInput] = useState('')
  const [sentence, setSentence] = useState<Sentence | null>(null)
  const [totalRecorded, setTotalRecorded] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [loading, setLoading] = useState(false)
  const [skipped, setSkipped] = useState(0)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const recordingBuffersRef = useRef<Float32Array[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)

  const fetchNextSentence = useCallback(async (spk: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sentences?speaker=${encodeURIComponent(spk)}`)
      const data = await res.json()
      if (data.done) {
        setSentence(null)
        setError('You have recorded all sentences!')
      } else {
        setSentence(data.sentence)
        setPhase('idle')
        setAudioBlob(null)
        setAudioUrl(null)
        setRecordingTime(0)
      }
    } catch {
      setError('Failed to load sentence')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCount = useCallback(async (spk: string) => {
    const res = await fetch(`/api/recordings?speaker=${encodeURIComponent(spk)}`)
    const data = await res.json()
    setTotalRecorded(data.recordings?.length || 0)
  }, [])

  const startSession = async () => {
    if (!speakerInput.trim()) return
    const name = speakerInput.trim()
    setSpeaker(name)
    await fetchNextSentence(name)
    await fetchCount(name)
  }

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      recordingBuffersRef.current = []

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContextClass()
      audioCtxRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      sourceRef.current = source

      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)
        recordingBuffersRef.current.push(new Float32Array(inputData))
      }

      source.connect(processor)
      processor.connect(audioContext.destination)

      startTimeRef.current = Date.now()
      setPhase('recording')
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch {
      setError('Microphone access denied. Please allow microphone and try again.')
    }
  }

  const stopRecording = () => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current.onaudioprocess = null
      processorRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (timerRef.current) clearInterval(timerRef.current)

    // Merge floating chunks
    const buffers = recordingBuffersRef.current
    let totalLength = 0
    for (const b of buffers) {
      totalLength += b.length
    }
    const mergedBuffer = new Float32Array(totalLength)
    let offset = 0
    for (const b of buffers) {
      mergedBuffer.set(b, offset)
      offset += b.length
    }

    const sampleRate = audioCtxRef.current?.sampleRate || 44100
    const wavBlob = bufferToWav(mergedBuffer, sampleRate)
    const url = URL.createObjectURL(wavBlob)

    setAudioBlob(wavBlob)
    setAudioUrl(url)
    setDuration(Date.now() - startTimeRef.current)
    setPhase('review')
  }

  const retake = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setPhase('idle')
  }

  const save = async () => {
    if (!audioBlob || !sentence) return
    setPhase('saving')
    setError(null)

    try {
      const form = new FormData()
      form.append('audio', audioBlob, 'recording.wav')
      form.append('speaker', speaker)
      form.append('sentence_id', sentence.id.toString())

      const upRes = await fetch('/api/upload', { method: 'POST', body: form })
      const upData = await upRes.json()
      if (!upRes.ok) throw new Error(upData.error)

      const recRes = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence_id: sentence.id,
          speaker_name: speaker,
          audio_url: upData.url,
          duration_ms: duration,
        }),
      })
      if (!recRes.ok) {
        const d = await recRes.json()
        throw new Error(d.error)
      }

      setPhase('saved')
      setTotalRecorded((c) => c + 1)

      setTimeout(() => {
        fetchNextSentence(speaker)
      }, 800)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
      setPhase('review')
    }
  }

  const skip = () => {
    setSkipped((s) => s + 1)
    fetchNextSentence(speaker)
  }

  const logout = () => {
    localStorage.removeItem('dzo_showSelector')
    localStorage.removeItem('dzo_speaker')
    setSpeaker('')
    setSpeakerInput('')
    setShowSelector(true)
    setSentence(null)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (processorRef.current) {
        processorRef.current.disconnect()
        processorRef.current.onaudioprocess = null
      }
      if (sourceRef.current) sourceRef.current.disconnect()
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close()
      }
    }
  }, [])

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedSelector = localStorage.getItem('dzo_showSelector')
    const savedSpeaker = localStorage.getItem('dzo_speaker')
    if (savedSelector === 'false') {
      setShowSelector(false)
      if (savedSpeaker) {
        setSpeaker(savedSpeaker)
        setSpeakerInput(savedSpeaker)
        fetchNextSentence(savedSpeaker)
        fetchCount(savedSpeaker)
      }
    }
  }, [fetchNextSentence, fetchCount])

  // Persist showSelector
  useEffect(() => {
    localStorage.setItem('dzo_showSelector', String(showSelector))
  }, [showSelector])

  // Persist speaker name
  useEffect(() => {
    if (speaker) {
      localStorage.setItem('dzo_speaker', speaker)
    } else {
      localStorage.removeItem('dzo_speaker')
    }
  }, [speaker])

  if (showSelector) {
    return <LanguageSelector onSelectDzongkha={() => setShowSelector(false)} />
  }

  // --- Login / Name Input ---
  if (!speaker) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <button
              onClick={() => setShowSelector(true)}
              className="inline-flex items-center gap-2 mb-6 text-neutral-500 text-sm hover:text-neutral-300 transition-colors bg-transparent border-0 cursor-pointer"
            >
              ← Back to language selector
            </button>
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-4xl">🇧🇹</span>
              <span className="text-2xl font-bold text-white tracking-tight font-sans">
                Dzongkha TTS
              </span>
            </div>
            <p className="text-neutral-500 text-sm">Voice Recording Platform by Aplos Lab</p>
          </div>

          <div className="bg-[#121212] border border-[#222222] rounded-xl p-5 sm:p-8">
            <h2 className="text-white font-medium text-base mb-1">Enter your name</h2>
            <p className="text-neutral-500 text-xs mb-6">Your recordings will be saved under this name</p>

            <input
              type="text"
              value={speakerInput}
              onChange={(e) => setSpeakerInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startSession()}
              placeholder="e.g. Ugyen, Karma, Sonam..."
              className="w-full bg-[#0a0a0a] border border-[#222222] rounded-lg px-4 py-3 text-white placeholder-neutral-700 outline-none focus:border-white transition-colors text-sm mb-4"
              autoFocus
            />

            <button
              onClick={startSession}
              disabled={!speakerInput.trim()}
              className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 text-black font-semibold py-3 rounded-lg transition-colors text-sm cursor-pointer disabled:cursor-not-allowed"
            >
              Start Recording
            </button>
          </div>

          <p className="text-center text-neutral-700 text-xs mt-6">
            1,983 Dzongkha sentences · Audio saved to Supabase Storage
          </p>
        </div>
      </div>
    )
  }

  // --- Main Recorder screen ---
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <header className="border-b border-[#222222] px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowSelector(true)}
            className="text-neutral-500 hover:text-white transition-colors text-sm bg-transparent border-0 cursor-pointer"
          >
            ←
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg">🇧🇹</span>
            <span className="text-white font-medium text-xs sm:text-sm">Dzongkha TTS</span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="text-right">
            <p className="text-white font-bold text-base sm:text-lg leading-none">{totalRecorded}</p>
            <p className="text-neutral-500 text-[9px] uppercase tracking-wider font-semibold">recorded</p>
          </div>
          {skipped > 0 && (
            <div className="text-right">
              <p className="text-neutral-400 font-bold text-base sm:text-lg leading-none">{skipped}</p>
              <p className="text-neutral-500 text-[9px] uppercase tracking-wider font-semibold">skipped</p>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-[#121212] border border-[#222222] px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            <span className="text-neutral-300 text-xs font-medium max-w-[60px] sm:max-w-[120px] truncate">{speaker}</span>
          </div>
          <button
            onClick={logout}
            className="text-neutral-500 hover:text-white text-xs transition-colors bg-transparent border-0 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-2xl mx-auto w-full">
        {loading && (
          <div className="text-center py-12">
            <div className="w-6 h-6 border border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-neutral-500 text-xs">Loading...</p>
          </div>
        )}

        {error && !loading && (
          <div className="w-full text-center">
            <div className="bg-[#121212] border border-[#222222] rounded-xl p-5 sm:p-8">
              <p className="text-white text-lg mb-2">{error}</p>
              <p className="text-neutral-500 text-xs">Total recorded: {totalRecorded}</p>
            </div>
          </div>
        )}

        {sentence && !loading && (
          <div className="w-full space-y-4">
            <div className="bg-[#121212] border border-[#222222] rounded-xl p-5 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-neutral-600 text-xs font-mono">#{sentence.id}</span>
                <div className="flex gap-4 text-neutral-600 text-xs">
                  <span>{sentence.char_count} chars</span>
                  <span>{sentence.token_count} tokens</span>
                </div>
              </div>

              <p
                className="text-white text-center select-none"
                style={{
                  fontSize: 'clamp(1.1rem, 4vw, 1.8rem)',
                  fontFamily: '"Noto Serif", "Noto Sans Tibetan", serif',
                  lineHeight: '2.5',
                }}
              >
                {sentence.sentence}
              </p>
            </div>

            <div className="bg-[#121212] border border-[#222222] rounded-xl p-5 sm:p-6">
              {phase === 'idle' && (
                <div className="text-center py-4">
                  <p className="text-neutral-400 text-xs mb-6">Read the sentence clearly, then tap record</p>
                  <button
                    onClick={startRecording}
                    className="w-16 h-16 rounded-full bg-white hover:bg-neutral-200 flex items-center justify-center mx-auto transition-all duration-200 cursor-pointer"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                  </button>
                  <p className="text-neutral-600 text-[10px] uppercase tracking-wider font-semibold mt-4">Start Recording</p>
                </div>
              )}

              {phase === 'recording' && (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2 mb-6 bg-red-950/20 border border-red-900/30 w-24 mx-auto py-1.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-red-400 text-xs font-mono font-bold leading-none">
                      {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:
                      {String(recordingTime % 60).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-end justify-center gap-0.5 h-10 mb-6">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white rounded-full opacity-80"
                        style={{
                          height: `${10 + Math.abs(Math.sin(i * 1.2)) * 26}px`,
                          animation: `waveBar ${0.4 + (i % 6) * 0.08}s ease-in-out infinite alternate`,
                          animationDelay: `${i * 0.04}s`,
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center mx-auto transition-all duration-200 cursor-pointer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <rect x="4" y="4" width="16" height="16" rx="1.5" />
                    </svg>
                  </button>
                  <p className="text-neutral-600 text-[10px] uppercase tracking-wider font-semibold mt-4">Stop Recording</p>
                </div>
              )}

              {(phase === 'review' || phase === 'saving' || phase === 'saved') && audioUrl && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-400 text-xs">Review your recording</span>
                    <span className="text-neutral-500 text-xs font-mono">{(duration / 1000).toFixed(1)}s</span>
                  </div>

                  <div className="bg-[#0c0c0c] border border-[#222222] rounded-lg p-2">
                    <audio src={audioUrl} controls className="w-full focus:outline-none" />
                  </div>

                  {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                  <div className="flex gap-4 pt-1">
                    <button
                      onClick={retake}
                      disabled={phase === 'saving' || phase === 'saved'}
                      className="flex-1 bg-transparent hover:bg-neutral-900 border border-[#222222] hover:border-neutral-700 text-neutral-400 hover:text-white font-medium py-3 rounded-lg transition-colors text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Retake
                    </button>
                    <button
                      onClick={save}
                      disabled={phase === 'saving' || phase === 'saved'}
                      className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 text-black font-semibold py-3 rounded-lg transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {phase === 'saving' && (
                        <div className="w-3.5 h-3.5 border border-black border-t-transparent rounded-full animate-spin" />
                      )}
                      {phase === 'saved' ? 'Saved! ✓' : phase === 'saving' ? 'Saving...' : 'Save & Next'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {(phase === 'idle' || phase === 'review') && (
              <div className="text-center pt-2">
                <button
                  onClick={skip}
                  className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Skip this sentence
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="h-[2px] bg-[#121212]">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{ width: `${Math.min((totalRecorded / 1983) * 100, 100)}%` }}
        />
      </div>

      <style jsx>{`
        @keyframes waveBar {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
