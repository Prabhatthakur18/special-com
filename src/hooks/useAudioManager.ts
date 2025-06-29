import { useRef, useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AudioInstance {
  audio: HTMLAudioElement
  isLoaded: boolean
  loadPromise?: Promise<void>
}

export const useAudioManager = () => {
  const audioInstances = useRef<Map<string, AudioInstance>>(new Map())
  const currentAudio = useRef<HTMLAudioElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Preload audio file
  const preloadAudio = useCallback(async (audioFile: string): Promise<void> => {
    if (audioInstances.current.has(audioFile)) {
      return audioInstances.current.get(audioFile)?.loadPromise || Promise.resolve()
    }

    const audio = new Audio()
    const instance: AudioInstance = {
      audio,
      isLoaded: false,
      loadPromise: undefined
    }

    audioInstances.current.set(audioFile, instance)

    const loadPromise = new Promise<void>((resolve, reject) => {
      const handleLoad = () => {
        instance.isLoaded = true
        audio.removeEventListener('canplaythrough', handleLoad)
        audio.removeEventListener('error', handleError)
        
        // Cache the load status in database
        supabase
          .from('audio_cache')
          .upsert({
            audio_file: audioFile,
            is_loaded: true,
            load_time: Date.now()
          })
          .then(() => resolve())
          .catch(() => resolve()) // Don't fail if DB update fails
      }

      const handleError = () => {
        audio.removeEventListener('canplaythrough', handleLoad)
        audio.removeEventListener('error', handleError)
        reject(new Error(`Failed to load audio: ${audioFile}`))
      }

      audio.addEventListener('canplaythrough', handleLoad)
      audio.addEventListener('error', handleError)
      
      // Set audio properties for better performance
      audio.preload = 'auto'
      audio.loop = true
      audio.volume = 0.7
      audio.src = audioFile
    })

    instance.loadPromise = loadPromise
    return loadPromise
  }, [])

  // Play audio with instant switching
  const playAudio = useCallback(async (audioFile: string): Promise<void> => {
    try {
      setIsLoading(true)

      // Stop current audio immediately
      if (currentAudio.current) {
        currentAudio.current.pause()
        currentAudio.current.currentTime = 0
      }

      // Get or create audio instance
      let instance = audioInstances.current.get(audioFile)
      
      if (!instance) {
        await preloadAudio(audioFile)
        instance = audioInstances.current.get(audioFile)
      }

      if (!instance) {
        throw new Error('Failed to create audio instance')
      }

      // Wait for audio to be loaded if not already
      if (!instance.isLoaded && instance.loadPromise) {
        await instance.loadPromise
      }

      // Set as current and play
      currentAudio.current = instance.audio
      instance.audio.currentTime = 0
      
      // Use requestAnimationFrame for smoother transition
      requestAnimationFrame(() => {
        instance!.audio.play().catch(error => {
          console.warn('Audio play failed:', error)
        })
      })

    } catch (error) {
      console.error('Error playing audio:', error)
    } finally {
      setIsLoading(false)
    }
  }, [preloadAudio])

  // Preload multiple audio files
  const preloadMultipleAudio = useCallback(async (audioFiles: string[]): Promise<void> => {
    const promises = audioFiles.map(file => preloadAudio(file).catch(err => {
      console.warn(`Failed to preload ${file}:`, err)
    }))
    
    await Promise.allSettled(promises)
  }, [preloadAudio])

  // Stop all audio
  const stopAll = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current.currentTime = 0
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioInstances.current.forEach(instance => {
        instance.audio.pause()
        instance.audio.src = ''
      })
      audioInstances.current.clear()
    }
  }, [])

  return {
    playAudio,
    preloadAudio,
    preloadMultipleAudio,
    stopAll,
    isLoading
  }
}