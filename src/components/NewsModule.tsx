import React, { useState } from 'react';
import { Newspaper, Volume2, ExternalLink, RefreshCw, Radio } from 'lucide-react';
import { INITIAL_NEWS } from '../data/mockData';
import { NewsArticle } from '../types/jarvis';
import { soundFX } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

export const NewsModule: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeArticleIndex, setActiveArticleIndex] = useState<number | null>(null);

  const broadcastAllHeadlines = () => {
    soundFX.playClick(850);
    setIsSpeaking(true);

    speechEngine.speak("Source: The Times Of India. Today's top headlines are...", () => {
      let idx = 0;
      const readNext = () => {
        if (idx < articles.length) {
          setActiveArticleIndex(idx);
          const headline = articles[idx].title;
          const isLast = idx === articles.length - 1;
          const textToSay = isLast
            ? `${headline}. These were the top headlines, Have a nice day Sir!`
            : `${headline}. Moving on to the next news headline...`;

          speechEngine.speak(textToSay, () => {
            idx++;
            if (!isLast) {
              setTimeout(readNext, 400);
            } else {
              setIsSpeaking(false);
              setActiveArticleIndex(null);
            }
          });
        }
      };
      readNext();
    });
  };

  const stopBroadcast = () => {
    speechEngine.stopSpeaking();
    setIsSpeaking(false);
    setActiveArticleIndex(null);
  };

  const speakSingleArticle = (art: NewsArticle, idx: number) => {
    soundFX.playClick(800);
    setActiveArticleIndex(idx);
    speechEngine.speak(`${art.source} reports: ${art.title}. ${art.snippet}`, () => {
      setActiveArticleIndex(null);
    });
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan flex flex-col backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-cyan-400" />
          <h2 className="font-hud text-sm sm:text-base font-bold tracking-wider text-cyan-300">
            INTELLIGENCE & NEWS FEED
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button
              onClick={stopBroadcast}
              className="cursor-pointer px-3 py-1 bg-red-600/40 hover:bg-red-600/60 border border-red-500/50 rounded text-red-200 text-xs font-hud flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              STOP BROADCAST
            </button>
          ) : (
            <button
              onClick={broadcastAllHeadlines}
              className="cursor-pointer px-3 py-1 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 rounded text-cyan-200 text-xs font-hud flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              BROADCAST NEWS
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {articles.map((art, idx) => {
          const isActive = activeArticleIndex === idx;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950'
                  : 'bg-slate-950/80 border-cyan-950 hover:border-cyan-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-code text-cyan-400/80 mb-1.5">
                <span className="uppercase tracking-wider font-semibold">{art.source}</span>
                <span>{art.time}</span>
              </div>

              <h4 className="font-hud text-xs sm:text-sm text-slate-100 font-semibold mb-1 leading-snug">
                {art.title}
              </h4>

              <p className="text-xs font-code text-slate-400 mb-2 leading-relaxed">
                {art.snippet}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                <button
                  onClick={() => speakSingleArticle(art, idx)}
                  className="cursor-pointer text-[11px] font-code text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Speak Article
                </button>

                <a
                  href={art.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-code text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  Read Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
