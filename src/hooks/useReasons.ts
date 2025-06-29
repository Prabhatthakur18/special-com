import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Reason {
  id: number
  title: string
  description: string
  image: string
  song: string
  audio_file: string
  order_index: number
  preload_offset: number
}

export const useReasons = () => {
  const [reasons, setReasons] = useState<Reason[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize database with default data
  const initializeDatabase = async () => {
    const defaultReasons = [
      {
        title: "💖 Your Kindness & Thoughtfulness",
        description: "I really admire how kind and thoughtful you are, Mam You always notice the little things and care in ways most people don't. It's one of the first things that drew me to you.",
        image: "/IMG-20250629-WA0018.jpg",
        song: "Tum Se Hi",
        audio_file: "/songs/Tum Se Hi.mp3",
        order_index: 0,
        preload_offset: 2000
      },
      {
        title: "👂 You Actually Listen",
        description: "You actually listen, Not just hearing words — you genuinely try to understand, and that makes conversations with you feel so real and meaningful.",
        image: "/IMG-20250629-WA0019.jpg",
        song: "Tum Se Kiran Dhoop Ki",
        audio_file: "/songs/Tum Se Kiran Dhoop Ki.mp3",
        order_index: 1,
        preload_offset: 2000
      },
      {
        title: "🌿 Your Calming Presence",
        description: "Being around you just feels calming, You have this quiet presence that makes everything feel okay, even when things are chaotic.",
        image: "/IMG-20250629-WA0020.jpg",
        song: "Raabta",
        audio_file: "/songs/Raabta.mp3",
        order_index: 2,
        preload_offset: 2000
      },
      {
        title: "😊 Your Beautiful Smile",
        description: "Your smile... it's something else, It's not just beautiful — it has this warmth that makes me feel like I'm in the right place when I see it.",
        image: "/IMG-20250629-WA0021.jpg",
        song: "Tera Ban Jaunga",
        audio_file: "/songs/Tera Ban Jaunga.mp3",
        order_index: 3,
        preload_offset: 2000
      },
      {
        title: "🧠 Your Emotional Awareness",
        description: "You're emotionally aware in a way that's rare, You get people, you feel things deeply, and you always seem to know when someone needs support — even without them saying it.",
        image: "/IMG-20250629-WA0022.jpg",
        song: "Rabba Rabba (Heropanti)",
        audio_file: "/songs/Rabba Rabba (Heropanti).mp3",
        order_index: 4,
        preload_offset: 2000
      },
      {
        title: "🌟 You Inspire Me",
        description: "You inspire me, Honestly, just by being yourself, you make me want to be a better version of who I already am.",
        image: "/IMG-20250629-WA0013.jpg",
        song: "Until I Found You",
        audio_file: "/songs/Until I Found You.mp3",
        order_index: 5,
        preload_offset: 2000
      },
      {
        title: "🫶 Your Genuine Nature",
        description: "You're genuine, You don't pretend to be someone you're not, and that honesty — that realness — is something I respect a lot.",
        image: "/IMG-20250629-WA0014.jpg",
        song: "Saathiyaa",
        audio_file: "/songs/Saathiyaa Singham 128 Kbps.mp3",
        order_index: 6,
        preload_offset: 2000
      },
      {
        title: "🦋 Your Quiet Strength",
        description: "You're strong, but in a quiet way, You deal with things without making a show of it, and that quiet strength is something I really admire.",
        image: "/IMG-20250629-WA0015.jpg",
        song: "Tumhare Hi Rahenge",
        audio_file: "/songs/Tumhare Hi Rahenge.mp3",
        order_index: 7,
        preload_offset: 2000
      },
      {
        title: "👁️‍🗨️ You Make People Feel Seen",
        description: "You have this way of making people feel seen, Like they matter. Like they're not invisible. That says a lot about the kind of heart you have.",
        image: "/IMG-20250629-WA0016.jpg",
        song: "Khoobsurat",
        audio_file: "/songs/Khoobsurat.mp3",
        order_index: 8,
        preload_offset: 2000
      },
      {
        title: "🌈 Everything Feels Easy And Natural With You",
        description: "With you, it all feels easy, I don't feel like I have to try too hard or put on a mask. I can just be me, and that's honestly the best feeling.",
        image: "/IMG-20250629-WA0017.jpg",
        song: "Ishq Hai",
        audio_file: "/songs/Ishq Hai.mp3",
        order_index: 9,
        preload_offset: 2000
      }
    ]

    try {
      const { error } = await supabase
        .from('reasons')
        .upsert(defaultReasons, { onConflict: 'order_index' })

      if (error) throw error
    } catch (err) {
      console.error('Error initializing database:', err)
    }
  }

  // Fetch reasons from database
  const fetchReasons = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('reasons')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error

      if (!data || data.length === 0) {
        // Initialize with default data if empty
        await initializeDatabase()
        return fetchReasons()
      }

      setReasons(data)
    } catch (err) {
      console.error('Error fetching reasons:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch reasons')
      
      // Fallback to hardcoded data if database fails
      setReasons([
        {
          id: 1,
          title: "💖 Your Kindness & Thoughtfulness",
          description: "I really admire how kind and thoughtful you are, Mam You always notice the little things and care in ways most people don't. It's one of the first things that drew me to you.",
          image: "/IMG-20250629-WA0018.jpg",
          song: "Tum Se Hi",
          audio_file: "/songs/Tum Se Hi.mp3",
          order_index: 0,
          preload_offset: 2000
        }
        // Add other fallback reasons as needed
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReasons()
  }, [])

  return {
    reasons,
    loading,
    error,
    refetch: fetchReasons
  }
}