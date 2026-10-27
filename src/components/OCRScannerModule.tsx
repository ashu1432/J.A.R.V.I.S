import React, { useRef, useState } from 'react';
import { ScanText, Camera, Upload, Volume2, Copy, Check, Sparkles } from 'lucide-react';
import { soundFX } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

interface OCRBox {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
}

const OCR_SAMPLES: Record<string, { image: string; text: string; boxes: OCRBox[] }> = {
  'stark_blueprint': {
    image: '/ImgContor.jpg',
    text: 'STARK INDUSTRIES ARCHIVE // QUANTUM ARC REACTOR SCHEMATICS 2026 // CORE TEMPERATURE: NOMINAL // OUTPUT: 3.2 GIGAWATTS',
    boxes: [
      { text: 'STARK INDUSTRIES', x: 40, y: 30, w: 260, h: 35, confidence: 98 },
      { text: 'QUANTUM ARC REACTOR', x: 40, y: 80, w: 310, h: 40, confidence: 95 },
      { text: 'OUTPUT: 3.2 GW', x: 40, y: 140, w: 200, h: 30, confidence: 93 }
    ]
  },
  'canny_edge': {
    image: '/canny.jpg',
    text: 'EDGE DETECTION & CONTOUR MATRIX // OPENCV HAAR CASCADE ALIGNED // RECOGNITION CONFIDENCE 94%',
    boxes: [
      { text: 'EDGE MATRIX', x: 50, y: 50, w: 220, h: 35, confidence: 96 },
      { text: 'HAAR CASCADE ALIGNED', x: 50, y: 110, w: 290, h: 35, confidence: 94 }
    ]
  }
};

export const OCRScannerModule: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<string>('stark_blueprint');
  const [recognizedText, setRecognizedText] = useState<string>(OCR_SAMPLES['stark_blueprint'].text);
  const [boxes, setBoxes] = useState<OCRBox[]>(OCR_SAMPLES['stark_blueprint'].boxes);
  const [imageUrl, setImageUrl] = useState<string>(OCR_SAMPLES['stark_blueprint'].image);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectSample = (key: string) => {
    soundFX.playClick(800);
    setSelectedSample(key);
    setImageUrl(OCR_SAMPLES[key].image);
    triggerOcrScan(OCR_SAMPLES[key].text, OCR_SAMPLES[key].boxes);
  };

  const triggerOcrScan = (textToExtract: string, sampleBoxes: OCRBox[]) => {
    setIsScanning(true);
    soundFX.playRadarPing();

    setTimeout(() => {
      setIsScanning(false);
      setRecognizedText(textToExtract);
      setBoxes(sampleBoxes);
      soundFX.playAccessGranted();
      speechEngine.speak("Optical Character Recognition complete. Text extracted successfully.");
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFX.playClick(750);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      triggerOcrScan(
        `EXTRACTED DOCUMENT TEXT // FILE: ${file.name.toUpperCase()} // RESOLUTION OPTIMIZED 640x480 // TESSERACT ENGINE READY`,
        [
          { text: file.name.slice(0, 15).toUpperCase(), x: 60, y: 60, w: 240, h: 36, confidence: 92 },
          { text: 'OCR PARSED DATA', x: 60, y: 120, w: 220, h: 32, confidence: 89 }
        ]
      );
    }
  };

  const speakText = () => {
    soundFX.playClick(900);
    speechEngine.speak(recognizedText);
  };

  const copyText = () => {
    navigator.clipboard.writeText(recognizedText);
    setCopied(true);
    soundFX.playClick(1000);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan flex flex-col backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ScanText className="w-5 h-5 text-cyan-400" />
          <h2 className="font-hud text-sm sm:text-base font-bold tracking-wider text-cyan-300">
            OPTICAL CHARACTER RECOGNITION (OCR.PY)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-code px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
            TESSERACT OCR 5.0
          </span>
        </div>
      </div>

      {/* Visual Canvas Viewport */}
      <div className="relative w-full aspect-16/9 bg-slate-950 rounded-lg overflow-hidden border border-cyan-500/30 flex items-center justify-center mb-4">
        <img
          src={imageUrl}
          alt="OCR Feed"
          className="w-full h-full object-contain filter contrast-125"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/jarvis1.jpg';
          }}
        />

        {/* OpenCV Green Bounding Boxes Overlay matching OCR.py */}
        {boxes.map((box, i) => (
          <div
            key={i}
            className="absolute border-2 border-emerald-400 bg-emerald-500/10 transition-all pointer-events-none"
            style={{
              left: `${(box.x / 400) * 80}%`,
              top: `${(box.y / 300) * 70}%`,
              width: `${(box.w / 400) * 40}%`,
              height: `${(box.h / 300) * 30}%`
            }}
          >
            <span className="absolute -top-4 left-0 text-[10px] font-code font-bold bg-emerald-950/90 text-emerald-300 px-1 border border-emerald-400/50">
              {box.text} ({box.confidence}%)
            </span>
          </div>
        ))}

        {/* Laser Sweep when scanning */}
        {isScanning && (
          <div className="absolute inset-0 bg-cyan-500/10 flex items-center justify-center">
            <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#00f0ff] animate-pulse" />
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-code text-slate-400">TEST PRESETS:</span>
          {Object.keys(OCR_SAMPLES).map((k) => (
            <button
              key={k}
              onClick={() => handleSelectSample(k)}
              className={`cursor-pointer px-2.5 py-1 rounded text-xs font-code border transition ${
                selectedSample === k
                  ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400'
                  : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-cyan-300'
              }`}
            >
              {k.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-code text-slate-200 flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Image to Scan</span>
          </button>
        </div>
      </div>

      {/* Extracted Text Box */}
      <div className="p-3 bg-slate-950/90 rounded-lg border border-cyan-500/30 font-code text-xs">
        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2 mb-2 text-cyan-400">
          <span className="text-[10px] tracking-wider font-bold">RECOGNIZED OCR OUTPUT:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={speakText}
              className="cursor-pointer hover:text-cyan-200 flex items-center gap-1 text-[11px]"
            >
              <Volume2 className="w-3.5 h-3.5" /> Speak
            </button>
            <button
              onClick={copyText}
              className="cursor-pointer hover:text-cyan-200 flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <p className="text-slate-200 leading-relaxed font-mono select-text">
          {recognizedText}
        </p>
      </div>
    </div>
  );
};
