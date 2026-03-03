import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Share2, Volume2, VolumeX } from 'lucide-react';

// --- Assets & Constants ---

const ASSETS = {
  logo: 'https://s3-ap-southeast-1.amazonaws.com/ricebowl/images/marketing-campaign/image-9520d447-0168-412d-9cd5-d083a3ab8884.png',
  background: 'https://files.ajt.my/images/marketing-campaign/image-743f9404-403e-443a-acd8-3f26097aa45f.jpg',
  title: 'https://files.ajt.my/images/marketing-campaign/image-395fb9e5-8616-491a-99f4-14daa3e36ea9.png',
  subheadline: 'https://files.ajt.my/images/marketing-campaign/image-88fccc49-e0b3-4497-90e3-56bfde40a1d5.png',
  date: 'https://files.ajt.my/images/marketing-campaign/image-37000be9-f927-425c-a3d5-620d96095d75.png',
  plate: 'https://freepngimg.com/download/dinner_plate/5-2-plates-png.png',
  foods: [
    'https://files.ajt.my/images/marketing-campaign/image-4803b43a-2352-40e0-874c-f4108c4e1a92.png', // Teh Tarik
    'https://files.ajt.my/images/marketing-campaign/image-f9a10658-07e8-4aef-abb0-5da9327001bf.png', // Nasi Briyani
    'https://files.ajt.my/images/marketing-campaign/image-20cf52f0-bb09-4086-9ceb-6cbcb03d58a2.png', // Nasi Lemak
    'https://files.ajt.my/images/marketing-campaign/image-87e4021a-48b2-479b-8398-4e6c260216c8.png', // Dates
    'https://files.ajt.my/images/marketing-campaign/image-f1aca1a6-1911-4256-acd1-583d18824d20.png', // Nasi Goreng
  ],
  rareTicket: 'https://files.ajt.my/images/marketing-campaign/image-3e036dd0-805e-4663-8bf2-16f71458cece.png',
  bomb: 'https://static.vecteezy.com/system/resources/thumbnails/009/350/665/small/explosive-bomb-black-png.png',
  voucher: 'https://files.ajt.my/images/marketing-campaign/image-4e0233e1-092e-4140-b615-6611d9d1a8dd.png',
  ticketDisplay: 'https://files.ajt.my/images/marketing-campaign/image-5d30bd35-ceee-41fe-9553-1c580ad2a425.png',
  music: 'https://cdn.pixabay.com/audio/2022/07/04/audio_09aef7c53d.mp3',
};

type GameState = 'LOADING' | 'LANDING' | 'GAME' | 'ENVELOPE' | 'QUALIFICATION' | 'RESULT';

interface UserData {
  companyName: string;
  email: string;
  phone: string;
  hasAccount: boolean | null;
}

interface QualificationData {
  timeline: string;
  budget: string;
  portals: string[];
  otherPortal: string;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOADING');
  const [userData, setUserData] = useState<UserData>({ companyName: '', email: '', phone: '', hasAccount: null });
  const [gameStats, setGameStats] = useState({ score: 0, stackCount: 0, ticketCount: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Background Music
  useEffect(() => {
    bgMusicRef.current = new Audio(ASSETS.music);
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.5;
    
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);

  // Handle Audio Playback
  useEffect(() => {
    if (bgMusicRef.current) {
      if (audioEnabled) {
        bgMusicRef.current.play().catch(e => console.log("Audio play failed (interaction needed):", e));
      } else {
        bgMusicRef.current.pause();
      }
    }
  }, [audioEnabled]);

  // Preload images
  useEffect(() => {
    const imageUrls = [
      ASSETS.logo, ASSETS.background, ASSETS.title, ASSETS.subheadline, ASSETS.date,
      ASSETS.plate, ...ASSETS.foods, ASSETS.rareTicket, ASSETS.bomb, ASSETS.voucher, ASSETS.ticketDisplay
    ];
    
    let loadedCount = 0;
    const total = imageUrls.length;

    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === total) {
          setImagesLoaded(true);
          setGameState('LANDING');
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        // Continue anyway to avoid blocking
        loadedCount++;
        if (loadedCount === total) {
          setImagesLoaded(true);
          setGameState('LANDING');
        }
      };
    });
  }, []);

  const handleStartGame = (data: UserData) => {
    const today = new Date().toISOString().split('T')[0];
    const playHistory = JSON.parse(localStorage.getItem('playHistory') || '{}');
    
    if (playHistory[data.email] === today) {
      alert("You've already played today! Come back tomorrow for another chance to win.");
      return;
    }

    playHistory[data.email] = today;
    localStorage.setItem('playHistory', JSON.stringify(playHistory));

    setUserData(data);
    console.log('Lead Form Submitted:', data);
    setGameState('GAME');
    if (!audioEnabled) setAudioEnabled(true);
  };

  const handleGameOver = (stats: { score: number, stackCount: number, ticketCount: number }) => {
    setGameStats(stats);
    if (stats.stackCount >= 10) {
      setGameState('ENVELOPE');
    } else {
      // Logic for failure? The prompt implies "Minimum 10 stacks to win". 
      // If they fail, maybe just show a "Try Again" or go to result with failure state?
      // For now, let's assume they can retry or go to a simplified result.
      // Let's send them to result but with a "Good try" message, or maybe just retry.
      // Prompt says: "If user reaches 10 stack minimum: They qualify for..."
      // Implicitly, if not, they don't. Let's just show the result page but maybe without the rewards unlocked.
      // Or better, let them retry immediately.
      alert("You need at least 10 items to win! Better luck next time.");
      setGameState('LANDING'); // Return to start
    }
  };

  const handleEnvelopeOpened = () => {
    setGameState('QUALIFICATION');
  };

  const handleQualificationSubmit = async (data: QualificationData) => {
    // Build the full payload matching the sheet columns
    const competitors = data.portals
      .map(p => p === 'Others' && data.otherPortal ? data.otherPortal : p)
      .join(', ');

    const gift = gameStats.ticketCount > 0
      ? `RM500 Voucher + ${gameStats.ticketCount} Lucky Draw Ticket(s)`
      : 'RM500 Voucher';

    const payload = {
      company_name:             userData.companyName,
      email:                    userData.email,
      phone_number:             `+60${userData.phone}`,
      ajobthing_account:        userData.hasAccount ? 'Yes' : 'No',
      score:                    gameStats.score,
      hiring_timeline:          data.timeline,
      hiring_budget:            data.budget,
      competitors,
      gift,
      total_lucky_draw_ticket:  gameStats.ticketCount,
    };

    // POST to Google Apps Script Web App webhook
    // Replace the URL below with your deployed Apps Script Web App URL
    const SHEET_WEBHOOK_URL = import.meta.env.VITE_SHEET_WEBHOOK_URL || '';

    if (SHEET_WEBHOOK_URL) {
      try {
        await fetch(SHEET_WEBHOOK_URL, {
          method: 'POST',
          // Apps Script requires text/plain to avoid CORS preflight on no-cors mode
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('Failed to send data to sheet:', err);
      }
    } else {
      console.warn('VITE_SHEET_WEBHOOK_URL is not set. Skipping sheet submission.');
    }

    setGameState('RESULT');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-slate-800 bg-black">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSETS.background})` }}
      />
      
      {/* Overlay Pattern (Subtle Darkening for readability) */}
      <div className="absolute inset-0 z-0 bg-black/20" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col">
        
        {/* Header / Logo */}
        <header className="absolute top-0 left-0 w-full px-6 pb-6 pt-10 flex justify-between items-center z-50">
          <img src={ASSETS.logo} alt="Ricebowl Logo" className="h-10 md:h-14 object-contain drop-shadow-md" />
          <button  
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
          >
            {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </header>

        {/* Views */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 w-full h-full">
          <AnimatePresence mode="wait">
            {gameState === 'LOADING' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-white"
              >
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p>Loading Rezeki...</p>
              </motion.div>
            )}

            {gameState === 'LANDING' && (
              <FrontPage key="landing" onStart={handleStartGame} />
            )}

            {gameState === 'GAME' && (
              <GameView key="game" assets={ASSETS} onGameOver={handleGameOver} audioEnabled={audioEnabled} />
            )}

            {gameState === 'ENVELOPE' && (
              <EnvelopeReveal key="envelope" stats={gameStats} onOpen={handleEnvelopeOpened} />
            )}

            {gameState === 'QUALIFICATION' && (
              <QualificationForm key="qualification" onSubmit={handleQualificationSubmit} />
            )}

            {gameState === 'RESULT' && (
              <ResultView key="result" stats={gameStats} />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// --- Sub-Components (Placeholders for now) ---

const FrontPage: React.FC<{ onStart: (data: UserData) => void }> = ({ onStart }) => {
  const [formData, setFormData] = useState<UserData>({ companyName: '', email: '', phone: '', hasAccount: null });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email || !formData.phone || formData.hasAccount === null) return;
    onStart(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="w-full h-full flex items-center justify-center p-4 pt-20 pb-4 overflow-y-auto"
    >
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center my-auto">
        
        {/* Left Side: Campaign Visuals */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
          <motion.img 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.2 }}
            src={ASSETS.title} 
            alt="Rezeki Stack Raya" 
            className="w-80 md:w-[28rem] drop-shadow-2xl cursor-pointer" 
          />
          
          <motion.img 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.4 }}
            src={ASSETS.subheadline} 
            alt="Stack the Halal Feast" 
            className="w-96 md:w-[28rem] drop-shadow-lg mx-auto lg:mx-0 cursor-pointer" 
          />
          
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ delay: 0.6 }}
            src={ASSETS.date} 
            alt="Campaign Duration" 
            className="h-8 md:h-10 object-contain drop-shadow-md mx-auto lg:mx-0" 
          />
          
          {/* Rewards Showcase - Compact */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/30 shadow-2xl w-full max-w-xl mt-2 mb-4 relative overflow-hidden group cursor-pointer"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             
             <h3 className="text-amber-300 font-extrabold mb-4 uppercase tracking-widest text-sm flex items-center gap-2">
               <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
               Win These Exclusive Rewards
             </h3>
             
             <div className="flex gap-6 justify-center lg:justify-start">
                <div className="flex-1 transform hover:-translate-y-1 transition-transform duration-300">
                   <div className="relative aspect-[4/3] mb-3 rounded-lg overflow-hidden shadow-lg border border-white/10">
                     <img src={ASSETS.voucher} alt="Voucher" className="w-full h-full object-cover scale-110" />
                   </div>
                   <p className="text-base font-bold text-white leading-tight">RM500 Voucher</p>
                   <p className="text-sm text-emerald-200">For Hiring Packages</p>
                </div>
                <div className="flex-1 transform hover:-translate-y-1 transition-transform duration-300 delay-75">
                   <div className="relative aspect-[4/3] mb-3 rounded-lg overflow-hidden shadow-lg border border-white/10">
                     <img src={ASSETS.ticketDisplay} alt="Lucky Draw" className="w-full h-full object-cover scale-110" />
                   </div>
                   <p className="text-base font-bold text-white leading-tight">Lucky Draw Ticket</p>
                   <p className="text-sm text-emerald-200">5-Star Hotel Buffet</p>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Right Side: Compact Form */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden w-full max-w-md mx-auto lg:ml-auto border border-white/50"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <h2 className="text-2xl font-extrabold text-white mb-2 relative z-10 leading-tight">
              Stack Foods & Earn Tickets
            </h2>
            <p className="text-emerald-100 text-sm font-medium relative z-10">Enter your details to start stacking!</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Company Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. AJobThing Sdn Bhd"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-sm text-gray-800 placeholder:text-gray-400"
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="name@company.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-sm text-gray-800 placeholder:text-gray-400"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
              <div className="flex shadow-sm rounded-lg overflow-hidden">
                 <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 text-gray-600 font-bold text-sm select-none">
                   🇲🇾 +60
                 </span>
                 <input 
                  type="tel" 
                  required
                  pattern="[0-9]*"
                  placeholder="123456789"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-sm text-gray-800 placeholder:text-gray-400"
                  value={formData.phone}
                  onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, phone: val});
                  }}
                />
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
               <label className="block text-xs font-bold text-emerald-900 mb-2">Do you have an AJobThing account?</label>
               <div className="flex gap-4">
                  <label className="flex-1 relative cursor-pointer group">
                     <input 
                        type="radio" 
                        name="hasAccount" 
                        className="peer sr-only"
                        checked={formData.hasAccount === true}
                        onChange={() => setFormData({...formData, hasAccount: true})}
                     />
                     <div className="flex items-center justify-center py-2 px-4 rounded-md border-2 border-emerald-200 bg-white text-emerald-700 font-bold text-sm transition-all peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white group-hover:border-emerald-400 shadow-sm">
                        Yes
                     </div>
                  </label>
                  <label className="flex-1 relative cursor-pointer group">
                     <input 
                        type="radio" 
                        name="hasAccount" 
                        className="peer sr-only"
                        checked={formData.hasAccount === false}
                        onChange={() => setFormData({...formData, hasAccount: false})}
                     />
                     <div className="flex items-center justify-center py-2 px-4 rounded-md border-2 border-emerald-200 bg-white text-emerald-700 font-bold text-sm transition-all peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white group-hover:border-emerald-400 shadow-sm">
                        No
                     </div>
                  </label>
               </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-extrabold text-xl rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
              Play Now <span className="text-2xl">🎮</span>
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

const GameView: React.FC<{ assets: typeof ASSETS, onGameOver: (stats: any) => void, audioEnabled: boolean }> = ({ assets, onGameOver, audioEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12); // Changed to 12s
  const [gameStarted, setGameStarted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    if (audioEnabled && !audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    } else if (!audioEnabled && audioCtxRef.current) {
      audioCtxRef.current.close().then(() => {
        audioCtxRef.current = null;
      });
    }
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [audioEnabled]);

  const playSound = (type: 'pop' | 'bomb') => {
    if (!audioEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'pop') {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // Game Constants
  const GRAVITY = 5; // Base falling speed
  const SPAWN_RATE = 40; // Frames between spawns
  const PLAYER_WIDTH = 200;
  const PLAYER_HEIGHT = 40; // Hitbox height for the plate
  const ITEM_SIZE = 120; // Increased from 100

  // Game State Refs (for loop access)
  const gameStateRef = useRef({
    score: 0,
    items: [] as any[],
    playerX: 0,
    gameActive: false,
    frameCount: 0,
    ticketCount: 0,
    stackHeight: 0, // Visual stack height
    speedMultiplier: 1.2, // Start faster
    shake: 0, // Shake duration frames
  });

  // Images Refs
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    // Preload images into refs for canvas use
    const loadImg = (src: string) => {
      const img = new Image();
      img.src = src;
      return img;
    };

    imagesRef.current = {
      plate: loadImg(assets.plate),
      bomb: loadImg(assets.bomb),
      rareTicket: loadImg(assets.rareTicket),
      ...assets.foods.reduce((acc, src, idx) => ({ ...acc, [`food${idx}`]: loadImg(src) }), {}),
    };
  }, [assets]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gameStateRef.current.playerX = canvas.width / 2;
    };
    window.addEventListener('resize', resize);
    resize();

    // Input Handling
    const handleMove = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      gameStateRef.current.playerX = Math.max(PLAYER_WIDTH/2, Math.min(canvas.width - PLAYER_WIDTH/2, x));
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    // Game Loop
    let animationFrameId: number;

    const loop = () => {
      if (!gameStateRef.current.gameActive) return;

      const state = gameStateRef.current;
      state.frameCount++;

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Increase difficulty
      if (state.frameCount % 300 === 0) { // Every ~5 seconds (faster difficulty ramp)
        state.speedMultiplier += 0.15;
      }

      // Spawn Items
      if (state.frameCount % Math.max(15, Math.floor(SPAWN_RATE / state.speedMultiplier)) === 0) {
        const rand = Math.random();
        let type = 'food';
        let imageKey = `food${Math.floor(Math.random() * assets.foods.length)}`;
        
        if (rand < 0.08 && state.ticketCount < 2) { // Allow max 2 tickets
          type = 'ticket';
          imageKey = 'rareTicket';
        } else if (rand < 0.25) { // Increased bomb chance
          type = 'bomb';
          imageKey = 'bomb';
        }

        state.items.push({
          x: Math.random() * (canvas.width - ITEM_SIZE),
          y: -ITEM_SIZE,
          type,
          imageKey,
          width: ITEM_SIZE,
          height: ITEM_SIZE,
          speed: (GRAVITY + Math.random() * 3) * state.speedMultiplier
        });
      }

      // Update & Draw Items
      for (let i = state.items.length - 1; i >= 0; i--) {
        const item = state.items[i];
        item.y += item.speed;

        // Draw Item
        const img = imagesRef.current[item.imageKey];
        
        // Glowing effect for ticket
        if (item.type === 'ticket') {
            ctx.save();
            ctx.shadowColor = '#fbbf24'; // Amber glow
            ctx.shadowBlur = 20 + Math.sin(state.frameCount * 0.1) * 10;
            if (img) {
                ctx.drawImage(img, item.x, item.y, item.width, item.height);
            } else {
                ctx.fillStyle = 'gold';
                ctx.fillRect(item.x, item.y, item.width, item.height);
            }
            ctx.restore();
        } else {
            if (img) {
              ctx.drawImage(img, item.x, item.y, item.width, item.height);
            } else {
                // Fallback
                ctx.fillStyle = item.type === 'bomb' ? 'red' : 'green';
                ctx.fillRect(item.x, item.y, item.width, item.height);
            }
        }

        // Collision Detection
        // Simple AABB collision with player plate area
        // Player hitbox is at the bottom
        const playerY = canvas.height - 120; // Plate position from bottom (adjusted for bigger plate)
        
        // Check if item hits the "stack" or plate
        // For simplicity, we just check if it hits the player's horizontal range at the correct height
        if (
          item.y + item.height > playerY &&
          item.y < playerY + PLAYER_HEIGHT &&
          item.x + item.width > state.playerX - PLAYER_WIDTH / 2 &&
          item.x < state.playerX + PLAYER_WIDTH / 2
        ) {
          // Collision!
          if (item.type === 'bomb') {
            state.score = Math.max(0, state.score - 1);
            state.stackHeight = Math.max(0, state.stackHeight - 1);
            state.shake = 20; // Shake for 20 frames
            playSound('bomb');
            // Shake effect (visual only, maybe add canvas offset later)
          } else if (item.type === 'ticket') {
            state.ticketCount += 1;
            playSound('pop');
          } else {
            state.score += 1;
            state.stackHeight += 1;
            playSound('pop');
          }
          
          setScore(state.score); // Sync React state
          state.items.splice(i, 1); // Remove item
          continue;
        }

        // Remove if off screen
        if (item.y > canvas.height) {
          state.items.splice(i, 1);
        }
      }

      // Shake Effect State
      if (state.shake > 0) {
        state.shake--;
        const shakeX = (Math.random() - 0.5) * 10;
        const shakeY = (Math.random() - 0.5) * 10;
        ctx.save();
        ctx.translate(shakeX, shakeY);
      }

      // Draw Player Plate
      const plateImg = imagesRef.current['plate'];
      const playerY = canvas.height - 120;
      if (plateImg) {
        ctx.drawImage(
            plateImg, 
            state.playerX - PLAYER_WIDTH / 2, 
            playerY, 
            PLAYER_WIDTH, 
            PLAYER_WIDTH * (plateImg.height / plateImg.width)
        );
      }

      // Draw Stacked Items (Visual representation of score)
      // We can draw them piling up on the plate
      const stackYStart = playerY;
      const stackLimit = 20; // Max items to show visually
      const visualStack = Math.min(state.stackHeight, stackLimit);
      
      for (let j = 0; j < visualStack; j++) {
          // Just draw generic food icons for the stack to save performance/complexity
          // Or use the last caught item? Let's just use a random food icon for visual flair
          // For stability, we'll just cycle through food images based on index
          const foodIdx = j % assets.foods.length;
          const stackImg = imagesRef.current[`food${foodIdx}`];
          if (stackImg) {
              const yPos = stackYStart - (j * 25) - 30; // Stack upwards (adjusted for bigger items)
              // Add some wobble
              const wobble = Math.sin(state.frameCount * 0.1 + j) * 5;
              ctx.drawImage(stackImg, state.playerX - 40 + wobble, yPos, 80, 80); // Bigger stack items
          }
      }

      if (state.shake > 0) { // Restore context after shake
          ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    if (gameStarted && !showTutorial) {
      gameStateRef.current.gameActive = true;
      loop();
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(animationFrameId);
      gameStateRef.current.gameActive = false;
    };
  }, [gameStarted, showTutorial, assets]);

  // Timer Logic
  useEffect(() => {
    if (!gameStarted || showTutorial) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          gameStateRef.current.gameActive = false;
          onGameOver({
            score: gameStateRef.current.score,
            stackCount: gameStateRef.current.stackHeight,
            ticketCount: gameStateRef.current.ticketCount
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameStarted, showTutorial, onGameOver]);

  const startGame = () => {
    setShowTutorial(false);
    setGameStarted(true);
    gameStateRef.current = {
        score: 0,
        items: [],
        playerX: canvasRef.current ? canvasRef.current.width / 2 : 0,
        gameActive: true,
        frameCount: 0,
        ticketCount: 0,
        stackHeight: 0,
        speedMultiplier: 1.2,
        shake: 0,
    };
    setScore(0);
    setTimeLeft(12);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm overflow-hidden">
      {/* HUD */}
      <div className="absolute top-28 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur text-emerald-900 px-4 py-2 rounded-lg shadow-lg border border-emerald-200">
          <p className="text-xs font-bold uppercase tracking-wider">Stack</p>
          <p className="text-2xl font-black">{score}</p>
        </div>
        
        <div className="flex flex-col items-center">
             <div className="w-48 h-4 bg-gray-200 rounded-full overflow-hidden border border-white/50 shadow-inner">
                <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, (score / 20) * 100)}%` }}
                />
             </div>
             <p className="text-white text-xs mt-1 font-bold drop-shadow-md">Target: 20 Stacks</p>
        </div>

        <div className={`bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border ${timeLeft < 5 ? 'border-red-500 text-red-600 animate-pulse' : 'border-emerald-200 text-emerald-900'}`}>
          <p className="text-xs font-bold uppercase tracking-wider">Time</p>
          <p className="text-2xl font-black">{timeLeft}s</p>
        </div>
      </div>

      {/* Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full touch-none cursor-none"
      />

      {/* Tutorial Overlay - Redesigned */}
      {showTutorial && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20 p-6 text-center">
          <div className="bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl max-w-2xl w-full">
            <h2 className="text-4xl font-extrabold text-amber-400 mb-8 drop-shadow-lg">How to Play</h2>
            
            <div className="flex flex-col items-center mb-8">
              <img 
                src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHZmYXk3bXRvMWhqeDlxMTY2bmtob3VkczhiazBjbTh4ZzM2eThiYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lEGyT2CDpRQAzg09Wb/giphy.gif" 
                alt="How to Play" 
                className="rounded-xl shadow-lg mb-6 w-full max-w-md object-cover border border-white/20"
              />
              <p className="text-lg md:text-xl font-medium text-white max-w-lg leading-relaxed">
                Move right and left to stack <span className="text-amber-400 font-bold">20 foods</span> in <span className="text-amber-400 font-bold">12 seconds</span>. 
                Avoid <span className="text-red-400 font-bold">BOMBS!</span> Catch the <span className="text-emerald-400 font-bold">Rare Lucky Draw Ticket</span>.
              </p>
            </div>

            <button 
              onClick={startGame}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-2xl px-10 py-5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border-b-4 border-emerald-800"
            >
              START GAME
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EnvelopeReveal: React.FC<{ stats: { score: number, stackCount: number, ticketCount: number }, onOpen: () => void }> = ({ stats, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(onOpen, 1500); // Wait for animation
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center cursor-pointer" onClick={handleOpen}>
        <AnimatePresence>
          {!isOpen ? (
            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              className="w-64 h-48 bg-amber-200 rounded-lg shadow-2xl border-4 border-amber-300 flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
              <div className="absolute top-0 left-0 w-full h-0 border-l-[128px] border-r-[128px] border-t-[100px] border-l-transparent border-r-transparent border-t-amber-300 transform origin-top transition-transform duration-500" />
              <div className="text-amber-800 font-bold text-xl z-10">Tap to Open Reward</div>
            </motion.div>
          ) : (
             <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                className="text-center text-white"
             >
                <h2 className="text-4xl font-bold text-amber-400 mb-4">Score: {stats.score}</h2>
                <p className="text-xl">Opening your rewards...</p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const QualificationForm: React.FC<{ onSubmit: (data: QualificationData) => void }> = ({ onSubmit }) => {
  const [data, setData] = useState<QualificationData>({ timeline: '', budget: '', portals: [] });
  const [otherPortal, setOtherPortal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...data, otherPortal: data.portals.includes('Others') ? otherPortal : '' });
  };

  const togglePortal = (portal: string) => {
    if (data.portals.includes(portal)) {
      setData({ ...data, portals: data.portals.filter(p => p !== portal) });
    } else {
      setData({ ...data, portals: [...data.portals, portal] });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-6xl mx-auto p-4 flex items-center justify-center h-full"
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-400 w-full flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-700 p-6 text-center shrink-0 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
           <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider drop-shadow-md relative z-10">
             Unlock Your Rezeki!
           </h2>
        </div>

        {/* Subheader */}
        <div className="bg-white p-4 text-center border-b border-gray-100 shrink-0">
           <p className="text-emerald-800 font-bold italic text-lg">
             "Just 3 quick questions to reveal your prosperity!"
           </p>
        </div>

        {/* Form Content - Scrollable if needed */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 bg-amber-50/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            
            {/* Column 1 */}
            <div className="flex flex-col h-full">
               <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">1</div>
                  <h3 className="font-bold text-emerald-900 text-sm md:text-base leading-tight pt-1">
                    What is your next hiring timeline?
                  </h3>
               </div>
               <div className="space-y-3 flex-1">
                  {['Currently hiring', 'Hiring after Raya', 'Hiring in 3 months', 'Not yet planned'].map(opt => (
                    <label key={opt} className={`block w-full p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${data.timeline === opt ? 'bg-emerald-100 border-emerald-500 shadow-md' : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="timeline" 
                        value={opt} 
                        required 
                        checked={data.timeline === opt}
                        onChange={e => setData({...data, timeline: e.target.value})}
                        className="sr-only"
                      />
                      <span className={`text-sm font-bold ${data.timeline === opt ? 'text-emerald-800' : 'text-gray-600'}`}>{opt}</span>
                    </label>
                  ))}
               </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col h-full">
               <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">2</div>
                  <h3 className="font-bold text-emerald-900 text-sm md:text-base leading-tight pt-1">
                    Do you already have a recruitment budget allocated?
                  </h3>
               </div>
               <div className="space-y-3 flex-1">
                  {[
                    'Yes, budget approved and not yet spent',
                    'Yes, budget approved and spent some',
                    'Budget pending approval',
                    'Not yet allocated/No budget'
                  ].map(opt => (
                    <label key={opt} className={`block w-full p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${data.budget === opt ? 'bg-emerald-100 border-emerald-500 shadow-md' : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="budget" 
                        value={opt} 
                        required 
                        checked={data.budget === opt}
                        onChange={e => setData({...data, budget: e.target.value})}
                        className="sr-only"
                      />
                      <span className={`text-sm font-bold ${data.budget === opt ? 'text-emerald-800' : 'text-gray-600'}`}>{opt}</span>
                    </label>
                  ))}
               </div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col h-full">
               <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">3</div>
                  <h3 className="font-bold text-emerald-900 text-sm md:text-base leading-tight pt-1">
                    Which job portals are you currently using for hiring? (Multiple choice)
                  </h3>
               </div>
               <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {['AJobThing (Maukerja & Ricebowl)', 'Jobstreet', 'LinkedIn', 'Recruitment agency', 'Social media', 'Others'].map(portal => (
                    <label key={portal} className={`block w-full p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${data.portals.includes(portal) ? 'bg-emerald-100 border-emerald-500 shadow-md' : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        checked={data.portals.includes(portal)}
                        onChange={() => togglePortal(portal)}
                        className="sr-only"
                      />
                      <span className={`text-sm font-bold ${data.portals.includes(portal) ? 'text-emerald-800' : 'text-gray-600'}`}>{portal}</span>
                    </label>
                  ))}
                  {data.portals.includes('Others') && (
                    <input 
                      type="text" 
                      placeholder="Please specify..." 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none mt-2"
                      value={otherPortal}
                      onChange={e => setOtherPortal(e.target.value)}
                    />
                  )}
               </div>
            </div>

          </div>
        </form>

        {/* Footer Action */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
          <button 
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-400 font-extrabold text-2xl rounded-xl shadow-inner cursor-not-allowed transition-all data-[ready=true]:from-amber-400 data-[ready=true]:to-amber-500 data-[ready=true]:text-emerald-900 data-[ready=true]:shadow-xl data-[ready=true]:cursor-pointer data-[ready=true]:hover:-translate-y-1"
            data-ready={data.timeline && data.budget && data.portals.length > 0}
            disabled={!data.timeline || !data.budget || data.portals.length === 0}
          >
            REVEAL REWARD ⚡
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ['#fcd34d', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }

    let animationId: number;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

const ResultView: React.FC<{ stats: { score: number, stackCount: number, ticketCount: number } }> = ({ stats }) => {
  const shareUrl = window.location.href;
  const shareText = "I just played Rezeki Stack Raya! Can you beat my score?";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 text-center border-4 border-amber-400 relative"
    >
      {stats.stackCount >= 10 && <Confetti />}
      <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-6">Congrats, You Get Rezeki Ramadan!</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <h3 className="font-bold text-emerald-800 mb-2 text-sm md:text-base">Guaranteed Reward</h3>
          <div className="h-40 flex items-center justify-center overflow-hidden rounded-lg shadow-sm bg-white">
             <img src={ASSETS.voucher} alt="Voucher" className="w-full h-full object-contain" />
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-semibold">Up to RM500 AJobThing Voucher</p>
        </div>

        <div className={`p-4 rounded-xl border ${stats.ticketCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-100 border-gray-200 opacity-70'}`}>
          <h3 className="font-bold text-gray-800 mb-2 text-sm md:text-base">{stats.ticketCount} Lucky Draw Ticket</h3>
          <div className="h-40 flex items-center justify-center overflow-hidden rounded-lg shadow-sm bg-white">
             <img src="https://files.ajt.my/images/marketing-campaign/image-5d30bd35-ceee-41fe-9553-1c580ad2a425.png" alt="Ticket" className={`w-full h-full object-contain ${stats.ticketCount === 0 && 'grayscale'}`} />
          </div>
          <p className="text-xs text-gray-600 mt-2 font-semibold">
            {stats.ticketCount > 0 ? "You're in Lucky Draw!" : 'Ticket not collected this time.'}
          </p>
        </div>
      </div>

      <p className="text-xs md:text-sm text-gray-500 italic mb-4">
        "If hiring, our Hiring Support will reach you to help your hiring needs via WhatsApp or Call."
      </p>

      {/* Tips to Win Callout */}
      <div className="bg-amber-100 border-2 border-amber-300 p-3 rounded-xl mb-6 animate-pulse">
        <p className="text-amber-800 font-bold text-xs md:text-sm">
          💡 Tips to Win: Use This Voucher to Buy Job Package & Earn More Lucky Draw Tickets!
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 text-xs md:text-sm font-bold"
          >
            <Share2 size={16} /> WhatsApp
          </button>
          <button 
            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-xs md:text-sm font-bold"
          >
            <Share2 size={16} /> LinkedIn
          </button>
          <button 
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-xs md:text-sm font-bold"
          >
            <Share2 size={16} /> Facebook
          </button>
        </div>

        <a 
          href="https://www.ajobthing.com/login?redirect=/campaign/rewards" 
          target="_blank" 
          rel="noreferrer"
          className="block w-full bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-900 font-bold text-lg md:text-xl py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
        >
          Want More Rezeki? Click Here
        </a>
        
        <div className="text-center mt-2">
          <p className="text-xs text-gray-600 font-semibold">Winners announcement on 11 March 2026</p>
          <a href="https://www.whatsapp.com/channel/0029VadYIsPB4hdYGIn57X2H" target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 font-bold underline">
            Join WhatsApp Channel
          </a>
        </div>
      </div>
    </motion.div>
  );
};
