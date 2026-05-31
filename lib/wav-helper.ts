/**
 * Converts a Float32Array of raw PCM audio samples into a standard 16-bit Mono WAV Blob.
 */
export function bufferToWav(buffer: Float32Array, sampleRate: number): Blob {
  const bufferLength = buffer.length
  const wavBuffer = new ArrayBuffer(44 + bufferLength * 2)
  const view = new DataView(wavBuffer)

  /* RIFF identifier */
  writeString(view, 0, 'RIFF')
  /* file length */
  view.setUint32(4, 36 + bufferLength * 2, true)
  /* RIFF type */
  writeString(view, 8, 'WAVE')
  /* format chunk identifier */
  writeString(view, 12, 'fmt ')
  /* format chunk length */
  view.setUint32(16, 16, true)
  /* sample format (raw PCM = 1) */
  view.setUint16(20, 1, true)
  /* channel count (1 = mono) */
  view.setUint16(22, 1, true)
  /* sample rate */
  view.setUint32(24, sampleRate, true)
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true)
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true)
  /* bits per sample */
  view.setUint16(34, 16, true)
  /* data chunk identifier */
  writeString(view, 36, 'data')
  /* data chunk length */
  view.setUint32(40, bufferLength * 2, true)

  // Write PCM audio samples
  let offset = 44
  for (let i = 0; i < bufferLength; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, buffer[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }

  return new Blob([view], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}
