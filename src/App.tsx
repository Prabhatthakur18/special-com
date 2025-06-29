import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ArrowLeft, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Music, Loader2 } from 'lucide-react';
import { useAudioManager } from './hooks/useAudioManager';

// Static data with all 10 reasons
const reasons = [
  {
    id: 1,
    title: "💖 Your Kindness & Thoughtfulness",
    description: "I really admire how kind and thoughtful you are, Mam You always notice the little things and care in ways most people don't. It's one of the first things that drew me to you.",
    image: "/IMG-20250629-WA0018.jpg",
    song: "Tum Se Hi",
    audio_file: "/songs/Tum Se Hi.mp3"
  },
  {
    id: 2,
    title: "👂 You Actually Listen",
    description: "You actually listen, Not just hearing words — you genuinely try to understand, and that makes conversations with you feel so real and meaningful.",
    image: "/IMG-20250629-WA0019.jpg",
    song: "Tum Se Kiran Dhoop Ki",
    audio_file: "/songs/Tum Se Kiran Dhoop Ki.mp3"
  },
  {
    id: 3,
    title: "🌿 Your Calming Presence",
    description: "Being around you just feels calming, You have this quiet presence that makes everything feel okay, even when things are chaotic.",
    image: "/IMG-20250629-WA0020.jpg",
    song: "Raabta",
    audio_file: "/songs/Raabta.mp3"
  },
  {
    id: 4,
    title: "😊 Your Beautiful Smile",
    description: "Your smile... it's something else, It's not just beautiful — it has this warmth that makes me feel like I'm in the right place when I see it.",
    image: "/IMG-20250629-WA0021.jpg",
    song: "Tera Ban Jaunga",
    audio_file: "/songs/Tera Ban Jaunga.mp3"
  },
  {
    id: 5,
    title: "🧠 Your Emotional Awareness",
    description: "You're emotionally aware in a way that's rare, You get people, you feel things deeply, and you always seem to know when someone needs support — even without them saying it.",
    image: "/IMG-20250629-WA0022.jpg",
    song: "Rabba Rabba (Heropanti)",
    audio_file: "/songs/Rabba Rabba (Heropanti).mp3"
  },
  {
    id: 6,
    title: "🌟 You Inspire Me",
    description: "You inspire me, Honestly, just by being yourself, you make me want to be a better version of who I already am.",
    image: "/IMG-20250629-WA0013.jpg",
    song: "Hum Apke Bina Kuchh nhi",
    audio_file: "/songs/WhatsApp Audio 2025-06-29 at 19.15.03_510d8751.mp3"
  },
  {
    id: 7,
    title: "🫶 Your Genuine Nature",
    description: "You're genuine, You don't pretend to be someone you're not, and that honesty — that realness — is something I respect a lot.",
    image: "/IMG-20250629-WA0014.jpg",
    song: "Saathiyaa",
    audio_file: "/songs/Saathiyaa Singham 128 Kbps.mp3"
  },
  {
    id: 8,
    title: "🦋 Your Quiet Strength",
    description: "You're strong, but in a quiet way, You deal with things without making a show of it, and that quiet strength is something I really admire.",
    image: "/IMG-20250629-WA0015.jpg",
    song: "Tumhare Hi Rahenge",
    audio_file: "/songs/Tumhare Hi Rahenge.mp3"
  },
  {
    id: 9,
    title: "👁️‍🗨️ You Make People Feel Seen",
    description: "You have this way of making people feel seen, Like they matter. Like they're not invisible. That says a lot about the kind of heart you have.",
    image: "/IMG-20250629-WA0016.jpg",
    song: "Khoobsurat",
    audio_file: "/songs/Khoobsurat.mp3"
  },
  {
    id: 10,
    title: "🌈 Everything Feels Easy And Natural With You",
    description: "With you, it all feels easy, I don't feel like I have to try too hard or put on a mask. I can just be me, and that's honestly the best feeling.",
    image: "/IMG-20250629-WA0017.jpg",
    song: "Ishq Hai",
    audio_file: "/songs/Ishq Hai.mp3"
  }
];

function App() {
  const { playAudio, preloadMultipleAudio, stopAll, isLoading: audioLoading, isReady } = useAudioManager();
  
  const [currentReason, setCurrentReason] = useState(0);
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isInFinalSection, setIsInFinalSection] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Preload all audio files when component mounts
  useEffect(() => {
    const audioFiles = [
      ...reasons.map(reason => reason.audio_file),
      '/songs/Zamaana Lage Metro In Dino 128 Kbps.mp3' // Final section song
    ];
    preloadMultipleAudio(audioFiles);
  }, [preloadMultipleAudio]);

  // Initialize audio on first user interaction
  useEffect(() => {
    const initializeAudio = () => {
      if (!audioInitialized && isReady) {
        setAudioInitialized(true);
        // Start playing the first song
        playAudio(reasons[0].audio_file);
      }
    };

    const handleUserInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    if (isReady && !audioInitialized) {
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
      
      // Also try to initialize immediately (works if autoplay is allowed)
      setTimeout(initializeAudio, 1000);
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [isReady, audioInitialized, playAudio]);

  // Create floating hearts animation
  useEffect(() => {
    const createHeart = () => {
      const newHeart = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: 100,
        delay: Math.random() * 2
      };
      setHearts(prev => [...prev.slice(-15), newHeart]);
    };

    const interval = setInterval(createHeart, 1500);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate reasons
  useEffect(() => {
    if (!isAutoPlay || !audioInitialized) return;
    
    const interval = setInterval(() => {
      setCurrentReason(prev => (prev + 1) % reasons.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlay, audioInitialized]);

  // Handle reason change with instant audio switching
  const handleReasonChange = useCallback(async (newIndex: number) => {
    if (newIndex === currentReason) return;
    
    setIsTransitioning(true);
    
    // Change reason immediately
    setCurrentReason(newIndex);
    
    // Play audio instantly if initialized
    const reason = reasons[newIndex];
    if (reason && !isInFinalSection && audioInitialized) {
      playAudio(reason.audio_file);
    }
    
    // Reset transition state quickly
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [currentReason, isInFinalSection, playAudio, audioInitialized]);

  // Play song when reason changes (only if audio is initialized)
  useEffect(() => {
    if (!isInFinalSection && audioInitialized && reasons[currentReason]) {
      playAudio(reasons[currentReason].audio_file);
    }
  }, [currentReason, isInFinalSection, playAudio, audioInitialized]);

  // Detect when user scrolls to final section
  useEffect(() => {
    const handleScroll = () => {
      const finalSection = document.getElementById('final-section');
      if (finalSection) {
        const rect = finalSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && !isInFinalSection && audioInitialized) {
          setIsInFinalSection(true);
          playAudio('/songs/Zamaana Lage Metro In Dino 128 Kbps.mp3');
        } else if (!isVisible && isInFinalSection && audioInitialized) {
          setIsInFinalSection(false);
          if (reasons[currentReason]) {
            playAudio(reasons[currentReason].audio_file);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isInFinalSection, currentReason, playAudio, audioInitialized]);

  const nextReason = () => {
    setIsAutoPlay(false);
    const nextIndex = (currentReason + 1) % reasons.length;
    handleReasonChange(nextIndex);
  };

  const prevReason = () => {
    setIsAutoPlay(false);
    const prevIndex = (currentReason - 1 + reasons.length) % reasons.length;
    handleReasonChange(prevIndex);
  };

  const goToReason = (index: number) => {
    setIsAutoPlay(false);
    handleReasonChange(index);
  };

  // Get specific image positioning for better mobile display
  const getImageClasses = (index: number) => {
    const baseClasses = "w-full h-full transition-transform duration-700 hover:scale-105";
    
    switch(index) {
      case 2: // Card 3 - Calming Presence (red saree image)
        return `${baseClasses} object-cover object-top`;
      case 3: // Card 4 - Beautiful Smile (cinema image)
        return `${baseClasses} object-cover object-top`;
      case 7: // Card 8 - Quiet Strength (orange traditional image)
        return `${baseClasses} object-cover object-top`;
      default:
        return `${baseClasses} object-cover object-center`;
    }
  };

  const currentReasonData = reasons[currentReason];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 overflow-hidden relative">
      {/* Floating Hearts Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {hearts.map(heart => (
          <div
            key={heart.id}
            className="absolute animate-float-up opacity-20"
            style={{
              left: `${heart.x}%`,
              bottom: `${heart.y}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: '10s'
            }}
          >
            <Heart className="w-4 h-4 text-pink-400 fill-current" />
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 pb-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-3">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-red-500 fill-current animate-pulse mr-2" />
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              Why I Like You Mam
            </h1>
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-red-500 fill-current animate-pulse ml-2" />
          </div>
          <p className="text-sm md:text-lg text-gray-600 font-medium">
            Every reason my heart beats for you, beautiful soul
          </p>
          
          {/* Audio Status Indicators */}
          {audioLoading && (
            <div className="mt-2 flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
              <span className="text-sm text-pink-600">Loading audio...</span>
            </div>
          )}
          
          {!audioInitialized && isReady && (
            <div className="mt-2 flex items-center justify-center space-x-2">
              <Music className="w-4 h-4 text-pink-500 animate-pulse" />
              <span className="text-sm text-pink-600">Click anywhere to start music</span>
            </div>
          )}
          
          {isTransitioning && (
            <div className="mt-2 flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
              <span className="text-sm text-pink-600">Switching song...</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Reason Display */}
      <main className="relative z-10 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Current Reason Card */}
          <section className="mb-8">
            <div className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-pink-100 overflow-hidden hover:shadow-3xl transition-all duration-500 ${isTransitioning ? 'opacity-75' : 'opacity-100'}`}>
              
              {/* Image Section */}
              <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                <img 
                  src={currentReasonData.image}
                  alt="Beautiful Sakshi"
                  className={getImageClasses(currentReason)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                
                {/* Song Badge */}
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                  <Music className={`w-4 h-4 text-white ${audioInitialized ? 'animate-pulse' : ''}`} />
                  <span className="text-white font-medium text-sm">
                    {currentReasonData.song}
                  </span>
                </div>
                
                {/* Navigation Arrows - RESTORED */}
                <button
                  onClick={prevReason}
                  disabled={isTransitioning}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group disabled:opacity-50"
                >
                  <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>
                
                <button
                  onClick={nextReason}
                  disabled={isTransitioning}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group disabled:opacity-50"
                >
                  <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>

                {/* Reason Counter */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white font-medium text-sm">
                    {currentReason + 1} / {reasons.length}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-8 lg:p-10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-6 animate-pulse">
                    <Heart className="w-8 h-8 text-white fill-current" />
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 leading-tight">
                    {currentReasonData.title}
                  </h2>
                  
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
                    {currentReasonData.description}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Progress Dots */}
          <section className="mb-8">
            <div className="flex justify-center space-x-2 flex-wrap">
              {reasons.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToReason(index)}
                  disabled={isTransitioning}
                  className={`w-3 h-3 rounded-full transition-all duration-300 m-1 disabled:opacity-50 ${
                    index === currentReason 
                      ? 'bg-pink-500 scale-125' 
                      : 'bg-pink-200 hover:bg-pink-300'
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Navigation Controls - COMMENTED OUT */}
          {/*
          <section className="mb-8">
            <div className="flex justify-center items-center space-x-4 flex-wrap">
              <button
                onClick={prevReason}
                disabled={isTransitioning}
                className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group m-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5 text-pink-600 group-hover:-translate-x-1 transition-transform" />
                <span className="text-pink-600 font-medium">Previous</span>
              </button>
              
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 m-2 ${
                  isAutoPlay 
                    ? 'bg-pink-500 text-white shadow-lg hover:bg-pink-600' 
                    : 'bg-white/70 text-pink-600 shadow-lg hover:bg-white/80'
                }`}
              >
                {isAutoPlay ? 'Pause' : 'Auto Play'}
              </button>
              
              <button
                onClick={nextReason}
                disabled={isTransitioning}
                className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group m-2 disabled:opacity-50"
              >
                <span className="text-pink-600 font-medium">Next</span>
                <ArrowRight className="w-5 h-5 text-pink-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>
          */}

          {/* Final Message */}
          <section id="final-section" className="text-center">
            <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-3xl p-6 md:p-8 lg:p-10 text-white shadow-2xl">
              <Sparkles className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
                And So Much More, Sakshi...
              </h3>
              <div className="space-y-4 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
                <p>
                  There are so many other things to like about you, Sakshi. 
                  Your beauty isn't just in your smile or the way you carry yourself — 
                  it radiates from within, from the strength of your character and the depth of your soul.
                </p>
                <p>
                  You have this incredible power to make everything around you brighter. 
                  Your strength isn't loud or demanding; it's quiet, steady, and absolutely captivating. 
                  The way you handle life with such grace and determination is something I deeply admire.
                </p>
                <p>
                  Every day I discover something new that makes me appreciate you even more. 
                  You are truly special, Sakshi, and I'm grateful to have you in my life. 
                  Your beauty, your strength, your character — everything about you is extraordinary. ❤️
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Custom Styles */}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 10s linear infinite;
        }
      `}</style>

    </div>
  );
}

export default App;
