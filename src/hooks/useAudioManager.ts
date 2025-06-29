import { useRef, useCallback, useEffect, useState } from 'react'

interface AudioInstance {
  audio: HTMLAudioElement
  isLoaded: boolean
  isPlaying: boolean
}

export const useAudioManager = () => {
  const audioInstances = useRef<Map<string, AudioInstance>>(new Map())
  const currentAudio = useRef<HTMLAudioElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // Create audio instance with proper event handling
  const createAudioInstance = useCallback((audioFile: string): AudioInstance => {
    const audio = new Audio()
    
    // Set audio properties for better performance
    audio.preload = 'auto'
    audio.loop = true
    audio.volume = 0.7
    audio.crossOrigin = 'anonymous'
    
    const instance: AudioInstance = {
      audio,
      isLoaded: false,
      isPlaying: false
    }

    // Handle loading events
    const handleCanPlay = () => {
      instance.isLoaded = true
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('loadeddata', handleCanPlay)
    }

    const handleError = (e: Event) => {
      console.warn(`Audio load error for ${audioFile}:`, e)
      audio.removeEventListener('error', handleError)
    }

    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('loadeddata', handleCanPlay)
    audio.addEventListener('error', handleError)
    
    // Set source and start loading
    audio.src = audioFile
    audio.load()

    return instance
  }, [])

  // Preload audio file
  const preloadAudio = useCallback(async (audioFile: string): Promise<void> => {
    if (audioInstances.current.has(audioFile)) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      const instance = createAudioInstance(audioFile)
      audioInstances.current.set(audioFile, instance)

      const checkLoaded = () => {
        if (instance.isLoaded || instance.audio.readyState >= 3) {
          resolve()
        } else {
          setTimeout(checkLoaded, 100)
        }
      }

      // Start checking immediately
      checkLoaded()
      
      // Also resolve after timeout to prevent hanging
      setTimeout(resolve, 3000)
    })
  }, [createAudioInstance])

  // Play audio with immediate response
  const playAudio = useCallback(async (audioFile: string): Promise<void> => {
    try {
      // Stop current audio immediately
      if (currentAudio.current && !currentAudio.current.paused) {
        currentAudio.current.pause()
        currentAudio.current.currentTime = 0
      }

      // Get or create audio instance
      let instance = audioInstances.current.get(audioFile)
      
      if (!instance) {
        instance = createAudioInstance(audioFile)
        audioInstances.current.set(audioFile, instance)
      }

      // Set as current audio
      currentAudio.current = instance.audio
      
      // Reset position
      instance.audio.currentTime = 0
      
      // Play immediately - don't wait for full load
      const playPromise = instance.audio.play()
      
      if (playPromise) {
        playPromise
          .then(() => {
            instance!.isPlaying = true
          })
          .catch(error => {
            // Handle autoplay restrictions
            if (error.name === 'NotAllowedError') {
              console.log('Autoplay blocked - user interaction required')
            } else {
              console.warn('Audio play failed:', error)
            }
          })
      }

    } catch (error) {
      console.error('Error in playAudio:', error)
    }
  }, [createAudioInstance])

  // Preload multiple audio files
  const preloadMultipleAudio = useCallback(async (audioFiles: string[]): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Create all instances first
      const promises = audioFiles.map(file => preloadAudio(file))
      
      // Wait for all to start loading (not necessarily complete)
      await Promise.allSettled(promises)
      
      setIsReady(true)
    } catch (error) {
      console.error('Error preloading audio:', error)
    } finally {
      setIsLoading(false)
    }
  }, [preloadAudio])

  // Stop all audio
  const stopAll = useCallback(() => {
    audioInstances.current.forEach(instance => {
      if (!instance.audio.paused) {
        instance.audio.pause()
        instance.audio.currentTime = 0
        instance.isPlaying = false
      }
    })
    currentAudio.current = null
  }, [])

  // Enable audio context on first user interaction
  useEffect(() => {
    const enableAudio = () => {
      // Create a dummy audio context to unlock audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }
      
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('touchstart', enableAudio)
    }

    document.addEventListener('click', enableAudio)
    document.addEventListener('touchstart', enableAudio)

    return () => {
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('touchstart', enableAudio)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioInstances.current.forEach(instance => {
        instance.audio.pause()
        instance.audio.src = ''
        instance.audio.load()
      })
      audioInstances.current.clear()
    }
  }, [])

  return {
    playAudio,
    preloadAudio,
    preloadMultipleAudio,
    stopAll,
    isLoading,
    isReady
  }
}