import { useRef, useCallback, useEffect, useState } from 'react'

interface AudioInstance {
  audio: HTMLAudioElement
  isLoaded: boolean
  loadPromise?: Promise<void>
}

export const useAudioManager = () => {
  const audioInstances = useRef<Map<string, AudioInstance>>(new Map())
  const currentAudio = useRef<HTMLAudioElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Preload audio file with immediate loading
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

    const loadPromise = new Promise<void>((resolve) => {
      const handleLoad = () => {
        instance.isLoaded = true
        audio.removeEventListener('canplaythrough', handleLoad)
        audio.removeEventListener('loadeddata', handleLoad)
        audio.removeEventListener('error', handleError)
        resolve()
      }

      const handleError = () => {
        audio.removeEventListener('canplaythrough', handleLoad)
        audio.removeEventListener('loadeddata', handleLoad)
        audio.removeEventListener('error', handleError)
        console.warn(`Failed to load audio: ${audioFile}`)
        resolve() // Don't reject, just resolve to continue
      }

      audio.addEventListener('canplaythrough', handleLoad)
      audio.addEventListener('loadeddata', handleLoad)
      audio.addEventListener('error', handleError)
      
      // Set audio properties for instant playback
      audio.preload = 'auto'
      audio.loop = true
      audio.volume = 0.7
      audio.crossOrigin = 'anonymous'
      
      // Force immediate loading
      audio.load()
      audio.src = audioFile
    })

    instance.loadPromise = loadPromise
    return loadPromise
  }, [])

  // Play audio with zero delay
  const playAudio = useCallback(async (audioFile: string): Promise<void> => {
    try {
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
        console.warn('Failed to create audio instance for:', audioFile)
        return
      }

      // Set as current audio
      currentAudio.current = instance.audio
      
      // Reset and play immediately
      instance.audio.currentTime = 0
      
      // Play without waiting - use immediate execution
      const playPromise = instance.audio.play()
      
      if (playPromise) {
        playPromise.catch(error => {
          console.warn('Audio play failed:', error)
        })
      }

    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }, [preloadAudio])

  // Preload multiple audio files in parallel
  const preloadMultipleAudio = useCallback(async (audioFiles: string[]): Promise<void> => {
    setIsLoading(true)
    
    const promises = audioFiles.map(file => 
      preloadAudio(file).catch(err => {
        console.warn(`Failed to preload ${file}:`, err)
      })
    )
    
    await Promise.allSettled(promises)
    setIsLoading(false)
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