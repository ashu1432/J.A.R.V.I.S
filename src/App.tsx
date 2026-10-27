import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Terminal,
  BookOpen,
  Newspaper,
  Navigation,
  ScanText,
  ShoppingBag,
  Database,
  Activity,
  Mic,
  MicOff,
  Camera,
  Volume2,
  VolumeX,
  ExternalLink,
  Lock,
  Unlock,
  Radio,
  Layers,
  Sparkles
} from 'lucide-react';

import { ActiveModule, MemoryEntry, VoiceCommandLog, VoicePersona } from './types/jarvis';
import { ArcReactorHUD } from './components/ArcReactorHUD';
import { FaceAuthModule } from './components/FaceAuthModule';
import { VoiceTerminal } from './components/VoiceTerminal';
import { DictionaryModule } from './components/DictionaryModule';
import { NewsModule } from './components/NewsModule';
import { WeatherModule } from './components/WeatherModule';
import { YouTubeDownloaderModule, YoutubeIcon } from './components/YouTubeDownloaderModule';
import { OCRScannerModule } from './components/OCRScannerModule';
import { AmazonTrackerModule } from './components/AmazonTrackerModule';
import { MemoryModule } from './components/MemoryModule';
import { DiagnosticsModule } from './components/DiagnosticsModule';
import { EmailModal } from './components/EmailModal';

import { soundFX } from './utils/audioFx';
import { speechEngine } from './utils/speechEngine';
import { PY_JOKES } from './data/mockData';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [persona, setPersona] = useState<VoicePersona>('JARVIS');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<string>('Gaurav (Master)');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [emailModalData, setEmailModalData] = useState<{ recipient: string; content: string }>({
    recipient: 'gauravsingh9356@gmail.com',
    content: 'Gaurav is a good boy'
  });
  const [notification, setNotification] = useState<string | null>(null);

  // Persistent memories initialized with data.txt content
  const [memories, setMemories] = useState<MemoryEntry[]>(() => {
    const saved = localStorage.getItem('jarvis_memories');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: '1',
        text: 'I have to wake up early in the morning',
        timestamp: 'System Initialized'
      }
    ];
  });

  // Terminal log
  const [commandLogs, setCommandLogs] = useState<VoiceCommandLog[]>([
    {
      id: 'init-1',
      sender: 'jarvis',
      text: 'J.A.R.V.I.S Mark LXXXV Core Initialized. Optical biometric security authenticated. Standing by for voice or terminal instruction, Sir.',
      timestamp: '00:00:01'
    }
  ]);

  // Keep memories in localStorage
  useEffect(() => {
    localStorage.setItem('jarvis_memories', JSON.stringify(memories));
  }, [memories]);

  // Real-time clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Configure speech engine callbacks
  useEffect(() => {
    speechEngine.setPersona(persona);
    speechEngine.setCallbacks({
      onSpeakingChange: (speaking) => setIsSpeaking(speaking),
      onListeningChange: (listening) => setIsListening(listening),
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          executeCommand(text);
        }
      }
    });
  }, [persona]);

  // Initial wishMe on start
  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = 'Good Evening SIR';
    if (hour >= 0 && hour < 12) greeting = 'Good Morning SIR';
    else if (hour >= 12 && hour < 18) greeting = 'Good Afternoon SIR';

    const welcomeSpeech = `${greeting}. I am J.A.R.V.I.S. Systems online. Please tell me how can I help you SIR?`;
    
    // Add to logs
    setCommandLogs((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'jarvis',
        text: welcomeSpeech,
        timestamp: new Date().toTimeString().split(' ')[0]
      }
    ]);
  }, []);

  // Voice persona switcher
  const handleTogglePersona = (newPersona: VoicePersona) => {
    soundFX.playClick(950);
    setPersona(newPersona);
    speechEngine.setPersona(newPersona);
    const msg = newPersona === 'FRIDAY'
      ? "Hello Sir, I am F.R.I.D.A.Y. Switched voice to female tactical assistant. How is it?"
      : "J.A.R.V.I.S voice restored. At your service, Sir.";
    
    addLog('jarvis', msg, `Switched persona to ${newPersona}`);
    speechEngine.speak(msg);
  };

  const addLog = (sender: 'user' | 'jarvis', text: string, actionTaken?: string) => {
    const newLog: VoiceCommandLog = {
      id: String(Date.now()) + Math.random(),
      sender,
      text,
      timestamp: new Date().toTimeString().split(' ')[0],
      actionTaken
    };
    setCommandLogs((prev) => [...prev, newLog]);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Central command interpreter mapping all Python logic in jarvis.py
  const executeCommand = async (rawQuery: string) => {
    const query = rawQuery.toLowerCase().trim();
    addLog('user', rawQuery);

    // 1. Voice switching
    if (query.includes('voice')) {
      if (query.includes('female') || query.includes('friday')) {
        handleTogglePersona('FRIDAY');
        return;
      } else {
        handleTogglePersona('JARVIS');
        return;
      }
    }

    // 2. Wikipedia search
    if (query.includes('wikipedia')) {
      const topic = query.replace('wikipedia', '').replace('search', '').trim();
      soundFX.playClick(850);
      addLog('jarvis', `Searching Wikipedia for "${topic}"...`);
      speechEngine.speak(`Searching Wikipedia for ${topic}`);

      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic || 'Iron Man')}`);
        if (res.ok) {
          const data = await res.json();
          const summary = data.extract ? data.extract.split('. ').slice(0, 2).join('. ') + '.' : 'According to Wikipedia, no direct summary available.';
          const fullMsg = `According to Wikipedia: ${summary}`;
          addLog('jarvis', fullMsg, 'Wikipedia summary query');
          speechEngine.speak(fullMsg);
          return;
        }
      } catch {
        // Fallback
      }
      const fallback = `According to Wikipedia, ${topic || 'Iron Man'} is a renowned subject in advanced cybernetics and engineering literature.`;
      addLog('jarvis', fallback, 'Wikipedia query');
      speechEngine.speak(fallback);
      return;
    }

    // 3. YouTube Downloader
    if (query.includes('youtube downloader') || query.includes('download youtube')) {
      setActiveModule('youtube_dl');
      const msg = "Opening YouTube Downloader Studio, Sir.";
      addLog('jarvis', msg, 'Navigated to YouTube Downloader');
      speechEngine.speak(msg);
      return;
    }

    // 4. "jarvis are you there"
    if (query.includes('are you there') || query.includes('jarvis are you there')) {
      const msg = "Yes Sir, at your service!";
      addLog('jarvis', msg, 'Status check');
      speechEngine.speak(msg);
      return;
    }

    // 5. "who made you" / "your master"
    if (query.includes('who made you') || query.includes('your master') || query.includes('who built you')) {
      const msg = "Gaurav is my master. He created me with artificial intelligence.";
      addLog('jarvis', msg, 'Creator information query');
      speechEngine.speak(msg);
      return;
    }

    // 6. "your name"
    if (query.includes('your name')) {
      const msg = `My name is ${persona}.`;
      addLog('jarvis', msg, 'Identity inquiry');
      speechEngine.speak(msg);
      return;
    }

    // 7. "stands for"
    if (query.includes('stands for')) {
      const msg = "J.A.R.V.I.S stands for JUST A RATHER VERY INTELLIGENT SYSTEM.";
      addLog('jarvis', msg, 'Acronym query');
      speechEngine.speak(msg);
      return;
    }

    // 8. "your friend"
    if (query.includes('your friend') || query.includes('friends')) {
      const msg = "My friends are Google Assistant, Alexa and Siri.";
      addLog('jarvis', msg, 'Allies list');
      speechEngine.speak(msg);
      return;
    }

    // 9. Time query
    if (query.includes('time') || query.includes('the time')) {
      const strTime = new Date().toLocaleTimeString();
      const msg = `Sir, the time is ${strTime}`;
      addLog('jarvis', msg, 'System clock inquiry');
      speechEngine.speak(msg);
      return;
    }

    // 10. CPU / Battery
    if (query.includes('cpu') || query.includes('battery')) {
      setActiveModule('diagnostics');
      const msg = "CPU load is at 28 percent. Battery level is at 92 percent and optimal.";
      addLog('jarvis', msg, 'Hardware diagnostics');
      speechEngine.speak(msg);
      return;
    }

    // 11. Joke (pyjokes)
    if (query.includes('joke')) {
      const randomJoke = PY_JOKES[Math.floor(Math.random() * PY_JOKES.length)];
      addLog('jarvis', randomJoke, 'PyJokes generator');
      speechEngine.speak(randomJoke);
      return;
    }

    // 12. Screenshot
    if (query.includes('screenshot')) {
      const msg = "Taking screenshot of primary HUD display buffer.";
      addLog('jarvis', msg, 'Screen capture');
      speechEngine.speak(msg);
      showNotification("Screenshot captured and stored in memory buffer.");
      soundFX.playClick(1200);
      return;
    }

    // 13. Weather
    if (query.includes('weather')) {
      setActiveModule('weather');
      const msg = "Current atmospheric conditions: Clear Sky, temperature 24.5 degrees Celsius, wind speed 4.8 metres per second.";
      addLog('jarvis', msg, 'Weather telemetry');
      speechEngine.speak(msg);
      return;
    }

    // 14. News
    if (query.includes('news') || query.includes('headline')) {
      setActiveModule('news');
      const msg = "Displaying top headlines from The Times Of India. Opening intelligence hub.";
      addLog('jarvis', msg, 'News broadcast');
      speechEngine.speak(msg);
      return;
    }

    // 15. Dictionary
    if (query.includes('dictionary') || query.includes('meaning') || query.includes('define')) {
      setActiveModule('dictionary');
      const word = query.replace('dictionary', '').replace('meaning of', '').replace('define', '').trim();
      const msg = word ? `Looking up definition for "${word}" in intelligent dictionary.` : "Intelligent sensing dictionary ready. What word would you like to define?";
      addLog('jarvis', msg, 'Dictionary lookup');
      speechEngine.speak(msg);
      return;
    }

    // 16. Remember that
    if (query.includes('remember that')) {
      const note = query.replace('remember that', '').trim();
      if (note) {
        const newEntry: MemoryEntry = {
          id: String(Date.now()),
          text: note,
          timestamp: new Date().toLocaleTimeString()
        };
        setMemories((prev) => [newEntry, ...prev]);
        const msg = `You told me to remember: ${note}. Saved to memory bank.`;
        addLog('jarvis', msg, 'Stored memory');
        speechEngine.speak(msg);
      } else {
        const msg = "What should I remember, Sir?";
        addLog('jarvis', msg);
        speechEngine.speak(msg);
      }
      return;
    }

    // 17. Do you remember anything
    if (query.includes('do you remember') || query.includes('remember anything')) {
      setActiveModule('memory');
      if (memories.length > 0) {
        const recallText = memories.map((m) => m.text).join('. ');
        const msg = `You said me to remember that: ${recallText}`;
        addLog('jarvis', msg, 'Memory recall');
        speechEngine.speak(msg);
      } else {
        const msg = "No active notes saved in data bank, Sir.";
        addLog('jarvis', msg);
        speechEngine.speak(msg);
      }
      return;
    }

    // 18. Open external links / websites
    if (query.includes('open youtube')) {
      window.open('https://youtube.com', '_blank');
      const msg = "Opening YouTube in browser, Sir.";
      addLog('jarvis', msg, 'Launched YouTube');
      speechEngine.speak(msg);
      return;
    }

    if (query.includes('open google')) {
      window.open('https://google.com', '_blank');
      const msg = "Opening Google in browser, Sir.";
      addLog('jarvis', msg, 'Launched Google');
      speechEngine.speak(msg);
      return;
    }

    if (query.includes('open amazon')) {
      window.open('https://amazon.com', '_blank');
      const msg = "Opening Amazon in browser, Sir.";
      addLog('jarvis', msg, 'Launched Amazon');
      speechEngine.speak(msg);
      return;
    }

    if (query.includes('open stackoverflow') || query.includes('stackoverflow')) {
      window.open('https://stackoverflow.com', '_blank');
      const msg = "Opening Stack Overflow in browser, Sir.";
      addLog('jarvis', msg, 'Launched StackOverflow');
      speechEngine.speak(msg);
      return;
    }

    if (query.includes('github')) {
      window.open('https://github.com/gauravsingh9356', '_blank');
      const msg = "Opening Gaurav's GitHub repository in browser, Sir.";
      addLog('jarvis', msg, 'Launched GitHub');
      speechEngine.speak(msg);
      return;
    }

    // 19. Search YouTube / Google
    if (query.includes('search youtube')) {
      const searchTerm = query.replace('search youtube', '').trim();
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`, '_blank');
      const msg = `Searching YouTube for ${searchTerm}`;
      addLog('jarvis', msg, 'YouTube search query');
      speechEngine.speak(msg);
      return;
    }

    if (query.includes('search')) {
      const searchTerm = query.replace('search', '').trim();
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
      const msg = `Searching Google for ${searchTerm}`;
      addLog('jarvis', msg, 'Google search query');
      speechEngine.speak(msg);
      return;
    }

    // 20. Location
    if (query.includes('location')) {
      const place = query.replace('location', '').trim();
      window.open(`https://google.nl/maps/place/${encodeURIComponent(place || 'New Delhi')}`, '_blank');
      const msg = `Here is the location for ${place || 'your sector'}`;
      addLog('jarvis', msg, 'Google Maps query');
      speechEngine.speak(msg);
      return;
    }

    // 21. Email
    if (query.includes('email to gaurav') || query.includes('send email') || query.includes('email')) {
      setEmailModalData({
        recipient: 'gauravsingh9356@gmail.com',
        content: 'Gaurav is a good boy'
      });
      setEmailModalOpen(true);
      const msg = "Opening SMTP email transmission interface. What should I say, Sir?";
      addLog('jarvis', msg, 'Email dispatch client');
      speechEngine.speak(msg);
      return;
    }

    // 22. Optical Face Recognition / Lock
    if (query.includes('face') || query.includes('biometric') || query.includes('auth')) {
      setActiveModule('face_auth');
      const msg = "Accessing Optical Face Recognition biometric suite.";
      addLog('jarvis', msg, 'Face recognition module');
      speechEngine.speak(msg);
      return;
    }

    // 23. OCR
    if (query.includes('ocr') || query.includes('scan text')) {
      setActiveModule('ocr_vision');
      const msg = "Optical Character Recognition scanner online.";
      addLog('jarvis', msg, 'OCR vision module');
      speechEngine.speak(msg);
      return;
    }

    // 24. Amazon tracker
    if (query.includes('amazon price') || query.includes('price tracker')) {
      setActiveModule('amazon_tracker');
      const msg = "Accessing Amazon price tracker radar for monitored assets.";
      addLog('jarvis', msg, 'Price radar module');
      speechEngine.speak(msg);
      return;
    }

    // Default intelligent conversational response
    const defaultResponse = `Understood, Sir. Executed neural analysis on "${rawQuery}". All Stark telemetry nominal.`;
    addLog('jarvis', defaultResponse);
    speechEngine.speak(defaultResponse);
  };

  const handleToggleMic = () => {
    soundFX.playClick(900);
    if (isListening) {
      speechEngine.stopListening();
    } else {
      speechEngine.startListening();
    }
  };

  const navigationItems: Array<{ id: ActiveModule; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'HUD CORE', icon: <Layers className="w-4 h-4" /> },
    { id: 'face_auth', label: 'FACE AUTH', icon: <Camera className="w-4 h-4" /> },
    { id: 'voice_terminal', label: 'VOICE TERMINAL', icon: <Terminal className="w-4 h-4" /> },
    { id: 'dictionary', label: 'DICTIONARY', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'news', label: 'NEWS FEED', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'weather', label: 'WEATHER RADAR', icon: <Navigation className="w-4 h-4" /> },
    { id: 'youtube_dl', label: 'YOUTUBE DL', icon: <YoutubeIcon className="w-4 h-4 text-red-500" /> },
    { id: 'ocr_vision', label: 'OCR SCANNER', icon: <ScanText className="w-4 h-4" /> },
    { id: 'amazon_tracker', label: 'PRICE TRACKER', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'memory', label: 'MEMORY VAULT', icon: <Database className="w-4 h-4" /> },
    { id: 'diagnostics', label: 'DIAGNOSTICS', icon: <Activity className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Scanline CRT overlay */}
      <div className="fixed inset-0 scanline-overlay pointer-events-none z-30" />

      {/* Floating HUD Notification */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-cyan-950/90 border border-cyan-400 rounded-lg shadow-lg text-cyan-200 text-xs font-code animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Holographic Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-cyan-500/30 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full border border-cyan-400 flex items-center justify-center glow-cyan bg-cyan-950/40">
              <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-hud font-extrabold text-base sm:text-lg tracking-wider text-cyan-300 glow-text-cyan">
                J.A.R.V.I.S
              </h1>
              <span className="text-[10px] font-code px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                MK LXXXV
              </span>
            </div>
            <p className="text-[10px] font-code text-slate-400 hidden sm:block">
              JUST A RATHER VERY INTELLIGENT SYSTEM
            </p>
          </div>
        </div>

        {/* Center Clock & Telemetry */}
        <div className="hidden md:flex items-center gap-4 text-xs font-code text-cyan-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-cyan-950">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYS TIME: {currentTime}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>MASTER:</span>
            <span className="text-cyan-300 font-bold">{currentUser}</span>
          </div>
        </div>

        {/* Persona Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Persona selector: J.A.R.V.I.S / F.R.I.D.A.Y */}
          <div className="flex items-center bg-slate-900 border border-cyan-500/40 rounded-lg p-0.5 text-xs font-hud">
            <button
              onClick={() => handleTogglePersona('JARVIS')}
              className={`cursor-pointer px-2.5 py-1 rounded transition ${
                persona === 'JARVIS'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/60 font-bold'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              JARVIS
            </button>
            <button
              onClick={() => handleTogglePersona('FRIDAY')}
              className={`cursor-pointer px-2.5 py-1 rounded transition ${
                persona === 'FRIDAY'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400/60 font-bold'
                  : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              FRIDAY
            </button>
          </div>

          {/* Quick Mic toggle */}
          <button
            onClick={handleToggleMic}
            title={isListening ? "Listening... click to stop" : "Start Voice Input"}
            className={`cursor-pointer p-2 rounded-lg border transition ${
              isListening
                ? 'bg-red-500/80 border-red-400 text-white animate-pulse'
                : 'bg-slate-900 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Biometric Status */}
          <button
            onClick={() => {
              soundFX.playClick(800);
              setActiveModule('face_auth');
            }}
            title="Biometric Face Recognition Status"
            className="cursor-pointer p-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-emerald-400 hover:bg-cyan-950 transition"
          >
            {isUnlocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <nav className="bg-slate-900/60 border-b border-cyan-950 px-3 py-1.5 overflow-x-auto flex items-center gap-1.5 scrollbar-none z-20">
        {navigationItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundFX.playClick(750);
                setActiveModule(item.id);
              }}
              className={`cursor-pointer shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md font-hud text-xs tracking-wider transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Workspace Body */}
      <main className="flex-1 p-3 sm:p-5 max-w-7xl mx-auto w-full z-10">
        {activeModule === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Concentric Arc Reactor Visualizer & System Vitality */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan backdrop-blur-md flex flex-col items-center">
                <ArcReactorHUD
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  persona={persona}
                  onToggleMic={handleToggleMic}
                  statusText={isListening ? "RECORDING SPEECH STREAM" : isSpeaking ? "AUDIO TRANSMISSION IN PROGRESS" : "ONLINE & STANDING BY"}
                />

                {/* Quick Action Matrix */}
                <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-cyan-950 text-xs font-code">
                  <button
                    onClick={() => executeCommand("tell me a joke")}
                    className="cursor-pointer p-2 rounded bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-cyan-200 transition text-center"
                  >
                    Tell Joke (PyJokes)
                  </button>
                  <button
                    onClick={() => executeCommand("check cpu & battery")}
                    className="cursor-pointer p-2 rounded bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-cyan-200 transition text-center"
                  >
                    Hardware Telemetry
                  </button>
                  <button
                    onClick={() => executeCommand("what are today's news headlines?")}
                    className="cursor-pointer p-2 rounded bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-cyan-200 transition text-center"
                  >
                    News Headlines
                  </button>
                  <button
                    onClick={() => executeCommand("report weather conditions")}
                    className="cursor-pointer p-2 rounded bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-cyan-200 transition text-center"
                  >
                    Atmospheric Radar
                  </button>
                </div>
              </div>

              {/* Quick Biometric Snapshot preview */}
              <div className="bg-slate-900/80 border border-cyan-950 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-hud text-xs text-slate-200 block font-semibold">
                      OPTICAL BIOMETRIC STATUS
                    </span>
                    <span className="text-[11px] font-code text-emerald-400">
                      LBPH Match: 96% (Gaurav Master)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModule('face_auth')}
                  className="cursor-pointer text-xs font-code text-cyan-400 hover:text-cyan-200 underline"
                >
                  Inspect Scanner
                </button>
              </div>
            </div>

            {/* Right: Conversational Voice Command Console */}
            <div className="lg:col-span-7 h-full">
              <VoiceTerminal
                logs={commandLogs}
                onExecuteCommand={executeCommand}
                isListening={isListening}
                onToggleMic={handleToggleMic}
                onClearLogs={() => setCommandLogs([])}
                persona={persona}
              />
            </div>
          </div>
        )}

        {/* Individual Modules */}
        {activeModule === 'face_auth' && (
          <FaceAuthModule
            isUnlocked={isUnlocked}
            onAuthenticated={(name) => {
              setIsUnlocked(true);
              setCurrentUser(`${name} (Authorized)`);
              showNotification(`Optical Face Recognition Verified: ${name}`);
            }}
            onLockAgain={() => {
              setIsUnlocked(false);
              showNotification("Biometric Lock Engaged");
            }}
          />
        )}

        {activeModule === 'voice_terminal' && (
          <VoiceTerminal
            logs={commandLogs}
            onExecuteCommand={executeCommand}
            isListening={isListening}
            onToggleMic={handleToggleMic}
            onClearLogs={() => setCommandLogs([])}
            persona={persona}
          />
        )}

        {activeModule === 'dictionary' && <DictionaryModule />}

        {activeModule === 'news' && <NewsModule />}

        {activeModule === 'weather' && <WeatherModule />}

        {activeModule === 'youtube_dl' && <YouTubeDownloaderModule />}

        {activeModule === 'ocr_vision' && <OCRScannerModule />}

        {activeModule === 'amazon_tracker' && <AmazonTrackerModule />}

        {activeModule === 'memory' && (
          <MemoryModule
            memories={memories}
            onAddMemory={(text) => {
              const item: MemoryEntry = {
                id: String(Date.now()),
                text,
                timestamp: new Date().toLocaleTimeString()
              };
              setMemories((prev) => [item, ...prev]);
            }}
            onDeleteMemory={(id) => {
              setMemories((prev) => prev.filter((m) => m.id !== id));
            }}
          />
        )}

        {activeModule === 'diagnostics' && <DiagnosticsModule />}
      </main>

      {/* SMTP Email Modal */}
      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        defaultRecipient={emailModalData.recipient}
        defaultContent={emailModalData.content}
      />

      {/* Futuristic Bottom Status Ribbon */}
      <footer className="mt-auto bg-slate-950/90 border-t border-cyan-950 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-code text-slate-500 z-20">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>STARK OS ARCHITECTURE 2026 // J.A.R.V.I.S CORE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>PORTED FROM: ashu1432/J.A.R.V.I.S</span>
          <span className="text-cyan-400">@G.S.</span>
        </div>
      </footer>
    </div>
  );
};
