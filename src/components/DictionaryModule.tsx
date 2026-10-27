import React, { useState } from 'react';
import { BookOpen, Search, Volume2, Sparkles, AlertCircle, Check, X } from 'lucide-react';
import { SEED_DICTIONARY, getCloseMatches } from '../data/mockData';
import { soundFX } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

export const DictionaryModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWord, setCurrentWord] = useState<string | null>('algorithm');
  const [definitions, setDefinitions] = useState<string[]>(SEED_DICTIONARY['algorithm'] || []);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const performLookup = async (word: string) => {
    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord) return;

    soundFX.playClick(750);
    setIsLoading(true);
    setSuggestion(null);
    setStatusMessage(null);

    // 1. Check local seed dictionary first
    if (SEED_DICTIONARY[cleanWord]) {
      const defs = SEED_DICTIONARY[cleanWord];
      setCurrentWord(cleanWord);
      setDefinitions(defs);
      setIsLoading(false);
      speechEngine.speak(`${cleanWord}: ${defs[0]}`);
      return;
    }

    // 2. Check for close matches (replicates difflib.get_close_matches in diction.py)
    const allWords = Object.keys(SEED_DICTIONARY);
    const closeMatches = getCloseMatches(cleanWord, allWords, 1, 0.4);

    if (closeMatches.length > 0) {
      const best = closeMatches[0];
      setSuggestion(best);
      setIsLoading(false);
      speechEngine.speak(`Did you mean ${best} instead?`);
      return;
    }

    // 3. Fallback: Query Dictionary API
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
      if (res.ok) {
        const data = await res.json();
        const apiDefs: string[] = [];
        data[0]?.meanings?.forEach((m: any) => {
          m.definitions?.slice(0, 2).forEach((d: any) => {
            if (d.definition) apiDefs.push(`(${m.partOfSpeech}) ${d.definition}`);
          });
        });
        if (apiDefs.length > 0) {
          setCurrentWord(cleanWord);
          setDefinitions(apiDefs);
          setIsLoading(false);
          speechEngine.speak(`${cleanWord}: ${apiDefs[0]}`);
          return;
        }
      }
    } catch {
      // API network fallback
    }

    // Word not found
    setIsLoading(false);
    setStatusMessage("Word doesn't exist. Please make sure you spelled it correctly.");
    speechEngine.speak("Word does not exist in lexicon. Please verify spelling.");
  };

  const handleSuggestionResponse = (accepted: boolean) => {
    if (accepted && suggestion) {
      soundFX.playClick(900);
      performLookup(suggestion);
    } else {
      soundFX.playClick(400);
      setSuggestion(null);
      setStatusMessage("Search cancelled for suggested entry.");
      speechEngine.speak("Understood, Sir.");
    }
  };

  const handleSpeakCurrent = () => {
    if (currentWord && definitions.length > 0) {
      soundFX.playClick(800);
      speechEngine.speak(`${currentWord}: ${definitions[0]}`);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan flex flex-col backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="font-hud text-sm sm:text-base font-bold tracking-wider text-cyan-300">
            INTELLIGENT SENSING DICTIONARY
          </h2>
        </div>
        <span className="text-[11px] font-code text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
          FUZZY SENSING ACTIVE
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && performLookup(searchTerm)}
          placeholder="Lookup word (e.g. algorithm, biometrics, arc reactor, algoritm)..."
          className="w-full bg-slate-950 border border-cyan-500/40 rounded-lg pl-9 pr-24 py-2.5 text-xs text-cyan-100 placeholder-slate-500 font-code focus:outline-none focus:border-cyan-300"
        />
        <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
        <button
          onClick={() => performLookup(searchTerm)}
          disabled={isLoading}
          className="cursor-pointer absolute right-1.5 top-1.5 px-3 py-1 bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/40 rounded text-xs font-hud tracking-wider transition"
        >
          {isLoading ? 'SEARCHING' : 'LOOKUP'}
        </button>
      </div>

      {/* Quick Test Chips */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        <span className="text-[10px] font-code text-slate-400">COMMON ENTRIES:</span>
        {['algorithm', 'arc reactor', 'cybernetics', 'biometrics', 'alga', 'algoritm (typo)'].map((w) => (
          <button
            key={w}
            onClick={() => {
              setSearchTerm(w.replace(' (typo)', ''));
              performLookup(w.replace(' (typo)', ''));
            }}
            className="cursor-pointer text-[10px] font-code px-2 py-0.5 rounded bg-slate-950 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition"
          >
            {w}
          </button>
        ))}
      </div>

      {/* Typo Correction Prompt (recreating difflib prompt in diction.py) */}
      {suggestion && (
        <div className="p-3 mb-4 rounded-lg bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-code text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Did you mean <strong className="text-cyan-300 underline uppercase">{suggestion}</strong> instead?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSuggestionResponse(true)}
              className="cursor-pointer px-3 py-1 bg-emerald-600/40 hover:bg-emerald-600/60 border border-emerald-400/50 rounded text-emerald-200 font-hud text-xs flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> YES
            </button>
            <button
              onClick={() => handleSuggestionResponse(false)}
              className="cursor-pointer px-3 py-1 bg-rose-600/40 hover:bg-rose-600/60 border border-rose-400/50 rounded text-rose-200 font-hud text-xs flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> NO
            </button>
          </div>
        </div>
      )}

      {/* Error or not found message */}
      {statusMessage && (
        <div className="p-3 mb-4 rounded-lg bg-red-950/30 border border-red-500/40 text-red-300 text-xs font-code flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Results Display */}
      {currentWord && definitions.length > 0 && (
        <div className="p-4 rounded-lg bg-slate-950/90 border border-cyan-950/80">
          <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2 mb-3">
            <div>
              <span className="text-[10px] font-code text-cyan-400 tracking-wider">DEFINED ENTRY:</span>
              <h3 className="font-hud text-lg font-bold text-cyan-200 uppercase tracking-wide">
                {currentWord}
              </h3>
            </div>
            <button
              onClick={handleSpeakCurrent}
              title="Pronounce & read definition"
              className="cursor-pointer p-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 transition"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {definitions.map((def, i) => (
              <div key={i} className="text-xs font-code text-slate-300 leading-relaxed pl-2 border-l-2 border-cyan-500/40">
                {def}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
