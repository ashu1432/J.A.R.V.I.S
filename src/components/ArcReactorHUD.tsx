import React from 'react';
import { VoicePersona } from '../types/jarvis';

interface ArcReactorHUDProps {
  isSpeaking: boolean;
  isListening: boolean;
  persona: VoicePersona;
  onToggleMic: () => void;
  statusText?: string;
}

export const ArcReactorHUD: React.FC<ArcReactorHUDProps> = ({
  isSpeaking,
  isListening,
  persona,
  onToggleMic,
  statusText = 'ONLINE & STANDING BY'
}) => {
  const isCyan = persona === 'JARVIS';
  const primaryColor = isCyan ? 'text-cyan-400' : 'text-amber-400';
  const borderColor = isCyan ? 'border-cyan-500/40' : 'border-amber-500/40';
  const glowShadow = isCyan ? 'glow-cyan' : 'glow-amber';

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      {/* Background Holographic Grid Accent */}
      <div className="absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-transparent pointer-events-none rounded-full" />

      {/* Main Reactor Assembly */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
        
        {/* Outer Ring with Tachometer Markings */}
        <div 
          className={`absolute inset-0 rounded-full border border-dashed ${borderColor} opacity-60 animate-spin-slow`}
          style={{ animationDuration: isSpeaking ? '8s' : '30s' }}
        />

        {/* Counter-rotating segmented ring */}
        <div 
          className={`absolute inset-3 sm:inset-4 rounded-full border-2 border-t-transparent border-b-transparent ${isCyan ? 'border-cyan-400' : 'border-amber-400'} opacity-75 animate-spin-reverse-slow`}
          style={{ animationDuration: isSpeaking ? '5s' : '20s' }}
        />

        {/* Secondary Concentric Geometric Dial */}
        <div className={`absolute inset-8 sm:inset-10 rounded-full border border-dotted ${borderColor} opacity-40 animate-spin-medium`} />

        {/* Waveform / Visualizer Pulse Ring */}
        <div 
          className={`absolute inset-12 sm:inset-14 rounded-full border ${isSpeaking ? 'border-cyan-300 scale-105' : 'border-cyan-800/60'} transition-all duration-300 flex items-center justify-center`}
        >
          {/* Circular Audio Spectrum Nodes */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            const height = isSpeaking 
              ? Math.sin(i * 1.5 + Date.now() / 200) * 12 + 14 
              : isListening 
              ? 10 
              : 4;
            return (
              <div
                key={i}
                className={`absolute w-1 rounded-full ${isCyan ? 'bg-cyan-400' : 'bg-amber-400'} transition-all duration-150`}
                style={{
                  height: `${height}px`,
                  transform: `rotate(${angle}deg) translateY(-85px)`,
                  opacity: isSpeaking ? 0.9 : 0.4
                }}
              />
            );
          })}
        </div>

        {/* Interactive Center Core / Arc Reactor Button */}
        <button
          onClick={onToggleMic}
          title={isListening ? "Listening... Click to stop" : "Click to speak with J.A.R.V.I.S"}
          className={`relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${glowShadow} ${
            isListening 
              ? 'bg-red-950/80 border-2 border-red-500 scale-105 shadow-red-500/50' 
              : isSpeaking
              ? isCyan 
                ? 'bg-cyan-950/90 border-2 border-cyan-300 scale-105' 
                : 'bg-amber-950/90 border-2 border-amber-300 scale-105'
              : 'bg-slate-950/80 border border-cyan-500/50 hover:border-cyan-400 hover:scale-102'
          }`}
        >
          {/* Inner Core Light */}
          <div 
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-500/30 border border-red-400 animate-ping'
                : isSpeaking 
                ? isCyan ? 'bg-cyan-400/30 animate-pulse' : 'bg-amber-400/30 animate-pulse' 
                : isCyan ? 'bg-cyan-500/20 border border-cyan-400/40' : 'bg-amber-500/20 border border-amber-400/40'
            }`}
          >
            <div className={`w-6 h-6 rounded-full ${isListening ? 'bg-red-400' : isCyan ? 'bg-cyan-300' : 'bg-amber-300'} shadow-lg`} />
          </div>

          {/* Persona Label */}
          <span className={`mt-1 font-hud font-bold text-xs sm:text-sm tracking-widest ${primaryColor}`}>
            {persona}
          </span>
          <span className="text-[10px] text-cyan-200/60 font-code uppercase">
            {isListening ? 'LISTENING' : isSpeaking ? 'TRANSMITTING' : 'CLICK TO MIC'}
          </span>
        </button>
      </div>

      {/* Sub-status label */}
      <div className="mt-4 flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : isSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="font-hud text-xs tracking-wider uppercase text-cyan-300/80">
            {statusText}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-code">
          {persona === 'JARVIS' ? 'Mark LXXXV Core AI Engine' : 'Tactical Female AI Persona'} • Voice & Vision Online
        </p>
      </div>
    </div>
  );
};
