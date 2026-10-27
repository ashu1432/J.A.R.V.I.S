import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Volume2, Sparkles, Check } from 'lucide-react';
import { MemoryEntry } from '../types/jarvis';
import { soundFX } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

interface MemoryModuleProps {
  memories: MemoryEntry[];
  onAddMemory: (text: string) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoryModule: React.FC<MemoryModuleProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory
}) => {
  const [inputText, setInputText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    soundFX.playClick(900);
    onAddMemory(inputText.trim());
    speechEngine.speak(`You told me to remember: ${inputText.trim()}`);
    setInputText('');
  };

  const speakMemory = (text: string) => {
    soundFX.playClick(800);
    speechEngine.speak(`You said me to remember that: ${text}`);
  };

  const recallAll = () => {
    soundFX.playClick(850);
    if (memories.length === 0) {
      speechEngine.speak("I don't have any saved memories in data bank at the moment, Sir.");
      return;
    }
    const all = memories.map((m) => m.text).join('. Also: ');
    speechEngine.speak(`You said me to remember that: ${all}`);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan flex flex-col backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <h2 className="font-hud text-sm sm:text-base font-bold tracking-wider text-cyan-300">
            PERSISTENT MEMORY VAULT (DATA.TXT)
          </h2>
        </div>
        <button
          onClick={recallAll}
          className="cursor-pointer px-3 py-1 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 rounded text-cyan-200 text-xs font-hud flex items-center gap-1.5"
        >
          <Volume2 className="w-3.5 h-3.5" /> RECALL ALL
        </button>
      </div>

      {/* Add Memory Form */}
      <form onSubmit={handleAdd} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='What should I remember, Sir? (e.g. "I have to wake up early in the morning")'
          className="flex-1 bg-slate-950 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs font-code text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-300"
        />
        <button
          type="submit"
          className="cursor-pointer px-4 py-2 bg-cyan-600/40 hover:bg-cyan-500/50 text-cyan-200 border border-cyan-400/50 rounded-lg text-xs font-hud tracking-wider flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> REMEMBER
        </button>
      </form>

      {/* Memories List */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {memories.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-code">
            Memory bank is currently empty.
          </div>
        ) : (
          memories.map((m) => (
            <div
              key={m.id}
              className="p-3 bg-slate-950/80 rounded-lg border border-cyan-950 hover:border-cyan-800/60 flex items-center justify-between gap-3 text-xs font-code"
            >
              <div className="flex-1">
                <p className="text-slate-200 font-medium">{m.text}</p>
                <span className="text-[10px] text-cyan-400/60">{m.timestamp}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => speakMemory(m.text)}
                  title="Read aloud"
                  className="cursor-pointer p-1.5 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950 rounded transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteMemory(m.id)}
                  title="Delete memory"
                  className="cursor-pointer p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
