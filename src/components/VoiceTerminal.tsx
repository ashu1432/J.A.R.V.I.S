import React, { useState } from 'react';
import { Send, Mic, MicOff, Terminal, Volume2, Sparkles, Trash2, ArrowUpRight } from 'lucide-react';
import { VoiceCommandLog, VoicePersona } from '../types/jarvis';
import { soundFX } from '../utils/audioFx';

interface VoiceTerminalProps {
  logs: VoiceCommandLog[];
  onExecuteCommand: (command: string) => void;
  isListening: boolean;
  onToggleMic: () => void;
  onClearLogs: () => void;
  persona: VoicePersona;
}

const PRESET_COMMANDS = [
  "Jarvis are you there?",
  "Who made you?",
  "What does J.A.R.V.I.S stand for?",
  "What is the time?",
  "Tell me a joke",
  "Check CPU & battery",
  "Search Wikipedia Iron Man",
  "What are today's news headlines?",
  "Report weather conditions",
  "Open YouTube Downloader",
  "Remember that I have a flight at 9 AM",
  "Do you remember anything?",
  "Switch voice to female (FRIDAY)",
  "Take a screenshot"
];

export const VoiceTerminal: React.FC<VoiceTerminalProps> = ({
  logs,
  onExecuteCommand,
  isListening,
  onToggleMic,
  onClearLogs,
  persona
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    soundFX.playClick(800);
    onExecuteCommand(inputVal.trim());
    setInputVal('');
  };

  const handleChipClick = (cmd: string) => {
    soundFX.playClick(850);
    onExecuteCommand(cmd);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan flex flex-col h-full backdrop-blur-md">
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h2 className="font-hud text-sm sm:text-base font-bold tracking-wider text-cyan-300">
            NEURAL VOICE & COMMAND INTERPRETER
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            title="Clear terminal log"
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <span className="font-code text-xs px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
            {persona} ACTIVE
          </span>
        </div>
      </div>

      {/* Suggested Quick Commands */}
      <div className="mb-3">
        <div className="text-[11px] font-code text-slate-400 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>DIRECT VOICE COMMAND PROTOCOLS:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {PRESET_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(cmd)}
              className="text-[11px] font-code px-2.5 py-1 rounded bg-slate-950/80 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition cursor-pointer flex items-center gap-1"
            >
              <span>{cmd}</span>
              <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Command Log Feed */}
      <div className="flex-1 min-h-[220px] max-h-[320px] overflow-y-auto space-y-2.5 p-3 rounded-lg bg-slate-950/90 border border-cyan-950/80 font-code text-xs">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-8">
            <Volume2 className="w-8 h-8 text-cyan-500/30 mb-2" />
            <p className="text-cyan-400/70">Awaiting audio or terminal instruction, Sir.</p>
            <p className="text-[11px]">Click a command above, type below, or activate microphone.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2.5 rounded border ${
                log.sender === 'user'
                  ? 'bg-slate-900/80 border-slate-700/60 text-slate-200'
                  : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className={`font-bold ${log.sender === 'user' ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {log.sender === 'user' ? '► USER COMMAND' : `◄ ${persona} RESPONSE`}
                </span>
                <span>{log.timestamp}</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {log.text}
              </div>
              {log.actionTaken && (
                <div className="mt-1 text-[10px] text-cyan-400/70 italic">
                  Executed: {log.actionTaken}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Field & Mic Action */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMic}
          title={isListening ? "Listening... click to stop" : "Start Voice Input"}
          className={`cursor-pointer p-2.5 rounded-lg border transition-all ${
            isListening 
              ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-red-500/50' 
              : 'bg-slate-800 text-cyan-400 border-cyan-500/40 hover:bg-cyan-950/60'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Enter command for ${persona} (e.g. "wikipedia quantum computing", "time", "joke")...`}
          className="flex-1 bg-slate-950 border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-code text-xs"
        />

        <button
          type="submit"
          className="cursor-pointer px-4 py-2 bg-cyan-600/40 hover:bg-cyan-500/50 text-cyan-200 border border-cyan-400/50 rounded-lg font-hud text-xs tracking-wider transition flex items-center gap-1.5"
        >
          <span>EXECUTE</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
