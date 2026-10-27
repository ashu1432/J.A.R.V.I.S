import React, { useState } from 'react';
import { Download, CheckCircle2, Play, AlertCircle, FileVideo, Radio, Video } from 'lucide-react';
import { soundFX } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

export const YoutubeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-red-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface VideoMeta {
  title: string;
  author: string;
  lengthMins: number;
  viewsMillions: number;
  sizeMb: number;
  thumbnail: string;
}

const SAMPLE_VIDEOS: Record<string, VideoMeta> = {
  'coding': {
    title: 'Python & React AI Voice Assistant Complete Engineering Course',
    author: 'Tech Talks with Gaurav (@G.S.)',
    lengthMins: 42.5,
    viewsMillions: 2.45,
    sizeMb: 148.2,
    thumbnail: '/images/maxresdefault.jpg'
  },
  'jarvis': {
    title: 'Iron Man J.A.R.V.I.S Real-Time Hologram & Voice HUD Demo',
    author: 'Stark Industries R&D',
    lengthMins: 14.2,
    viewsMillions: 12.8,
    sizeMb: 86.4,
    thumbnail: '/images/maxresdefault (1).jpg'
  },
  'music': {
    title: 'Roi Na - Master Acoustic Session',
    author: 'Gaurav Studio Beats',
    lengthMins: 3.8,
    viewsMillions: 5.1,
    sizeMb: 24.6,
    thumbnail: '/images/photo.jpg'
  }
};

export const YouTubeDownloaderModule: React.FC = () => {
  const [url, setUrl] = useState<string>('https://www.youtube.com/watch?v=jarvis_ai_hud');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'fetching' | 'downloading' | 'completed'>('idle');
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(SAMPLE_VIDEOS['jarvis']);
  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'mp3'>('mp4');

  const handleStartDownload = () => {
    if (!url.trim()) return;
    soundFX.playClick(900);
    setStatus('fetching');

    // Simulate fetching video info
    setTimeout(() => {
      let meta = SAMPLE_VIDEOS['jarvis'];
      if (url.toLowerCase().includes('coding') || url.toLowerCase().includes('python')) {
        meta = SAMPLE_VIDEOS['coding'];
      } else if (url.toLowerCase().includes('music') || url.toLowerCase().includes('roina')) {
        meta = SAMPLE_VIDEOS['music'];
      }
      setVideoMeta(meta);
      setStatus('downloading');
      setDownloadProgress(0);

      // Simulate PyTube chunk download progress callback
      const interval = setInterval(() => {
        setDownloadProgress((prev: number) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus('completed');
            soundFX.playAccessGranted();
            speechEngine.speak(`Download complete for ${meta.title}`);
            return 100;
          }
          const increment = Math.floor(Math.random() * 12) + 8;
          return Math.min(prev + increment, 100);
        });
      }, 250);
    }, 600);
  };

  const handleSelectPreset = (key: string) => {
    soundFX.playClick(750);
    const meta = SAMPLE_VIDEOS[key];
    setVideoMeta(meta);
    setUrl(`https://www.youtube.com/watch?v=${key}_sample_stream`);
    setStatus('idle');
    setDownloadProgress(0);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan flex flex-col backdrop-blur-md">
      {/* Title Bar styled with Tkinter homage */}
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <YoutubeIcon className="w-5 h-5 text-red-500" />
          <h2 className="font-hud text-sm sm:text-base font-bold tracking-wider text-cyan-300">
            YOUTUBE STREAM DOWNLOADER (PYTUBE ENGINE)
          </h2>
        </div>
        <span className="text-[11px] font-code px-2 py-0.5 rounded bg-blue-950/70 border border-blue-500/40 text-blue-300">
          TKINTER GUI V2.0
        </span>
      </div>

      {/* Main Tkinter-styled Container */}
      <div className="bg-[#3498DB]/15 border-2 border-[#3498DB]/40 rounded-xl p-4 sm:p-6 mb-4 flex flex-col items-center">
        {/* Header Icon matching photo.png in Tkinter app */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40">
            <YoutubeIcon className="w-7 h-7 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-hud text-lg font-bold text-white tracking-wide">
              My YouTube Downloader
            </h3>
            <p className="text-xs font-code text-cyan-200">
              High-Speed Media Stream Extractor
            </p>
          </div>
        </div>

        {/* URL Entry Field */}
        <div className="w-full max-w-lg mb-4">
          <label className="block text-[11px] font-code text-cyan-200 uppercase mb-1">
            Video URL Input:
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
            className="w-full bg-slate-950 border-2 border-cyan-400/60 rounded-lg px-4 py-2.5 text-center font-code text-xs sm:text-sm text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-300 shadow-inner"
          />
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-4 mb-4 text-xs font-code">
          <span className="text-slate-300">Format:</span>
          <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300">
            <input
              type="radio"
              checked={selectedFormat === 'mp4'}
              onChange={() => setSelectedFormat('mp4')}
              className="accent-cyan-400"
            />
            <span>MP4 Video (1080p High Res)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300">
            <input
              type="radio"
              checked={selectedFormat === 'mp3'}
              onChange={() => setSelectedFormat('mp3')}
              className="accent-cyan-400"
            />
            <span>MP3 Audio (320kbps)</span>
          </label>
        </div>

        {/* Download Action Button matching Tkinter dBtn */}
        <button
          onClick={handleStartDownload}
          disabled={status === 'downloading' || status === 'fetching'}
          className={`cursor-pointer px-6 py-2.5 rounded-lg font-hud text-sm font-bold tracking-wider transition-all shadow-lg flex items-center gap-2 ${
            status === 'downloading'
              ? 'bg-amber-600 text-white animate-pulse'
              : status === 'completed'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 hover:bg-red-500 text-white hover:scale-102'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>
            {status === 'fetching'
              ? 'Please wait...'
              : status === 'downloading'
              ? `${downloadProgress}% DOWNLOADED`
              : status === 'completed'
              ? 'DOWNLOAD FINISHED'
              : 'START DOWNLOAD'}
          </span>
        </button>

        {/* Progress bar */}
        {status === 'downloading' && (
          <div className="w-full max-w-lg mt-4 bg-slate-950/80 p-2 rounded-lg border border-cyan-400/40">
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-200"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Download Success Dialog Box */}
        {status === 'completed' && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-400 rounded-lg flex items-center gap-3 text-emerald-200 text-xs font-code max-w-lg animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">Download Finished</div>
              <div>Stream packet extracted and saved to local disk cache.</div>
            </div>
          </div>
        )}

        {/* Video Metadata Inspector (Tkinter label & desc) */}
        {videoMeta && (
          <div className="w-full max-w-lg mt-5 p-4 bg-slate-950/90 rounded-lg border border-cyan-500/30 text-xs font-code">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2 mb-2 text-cyan-400">
              <span className="font-bold">INSPECTED STREAM METADATA</span>
              <span>Size: {videoMeta.sizeMb} MB</span>
            </div>
            <div className="font-hud font-semibold text-slate-100 text-sm mb-1">
              {videoMeta.title}
            </div>
            <div className="text-slate-400 mb-2">
              Author: <span className="text-cyan-300">{videoMeta.author}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Length: {videoMeta.lengthMins} mins</span>
              <span>Views: {videoMeta.viewsMillions}M</span>
              <span>Format: {selectedFormat.toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* Tkinter bottom author tag: @G.S. */}
        <div className="mt-4 font-mono font-bold text-lg text-cyan-300 tracking-widest opacity-80">
          @G.S.
        </div>
      </div>

      {/* Preset Stream Demos */}
      <div className="flex items-center justify-between text-xs font-code">
        <span className="text-slate-400">QUICK DEMO STREAMS:</span>
        <div className="flex gap-2">
          {Object.keys(SAMPLE_VIDEOS).map((k) => (
            <button
              key={k}
              onClick={() => handleSelectPreset(k)}
              className="cursor-pointer px-2.5 py-1 rounded bg-slate-950 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/40 text-slate-300 text-[11px] uppercase transition"
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
