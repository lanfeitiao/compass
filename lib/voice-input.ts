// Leave room for multipart metadata below the hosting platform's request limit.
export const MAX_VOICE_BYTES = 4_000_000
export const MAX_VOICE_SECONDS = 120

export function voiceFileExtension(mimeType: string): 'webm' | 'mp4' | null {
  switch (mimeType.split(';')[0].trim().toLowerCase()) {
    case 'audio/webm':
      return 'webm'
    case 'audio/mp4':
    case 'audio/x-m4a':
      return 'mp4'
    default:
      return null
  }
}
