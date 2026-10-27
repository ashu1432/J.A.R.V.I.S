import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Shield, ShieldAlert, Sparkles, RefreshCw, UserCheck } from 'lucide-react';
import { soundFX } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

interface FaceAuthModuleProps {
  onAuthenticated: (userName: string) => void;
  isUnlocked: boolean;
  onLockAgain: () => void;
}

export const FaceAuthModule: React.FC<FaceAuthModuleProps> = ({
  onAuthenticated,
  isUnlocked,
  onLockAgain
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [detectedUser, setDetectedUser] = useState<string>('Unknown');
  const [matchConfidence, setMatchConfidence] = useState<number>(0);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [trainingSamples, setTrainingSamples] = useState<number>(30);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      soundFX.playClick(600);
    } catch {
      setCameraActive(false);
      setCameraError("Webcam access unavailable or denied. Using synthetic biometric scanner mode.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Continuous HUD scanning animation on canvas
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scanY = 0;
    let scanDirection = 1;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bounding box matching OpenCV in Face recognition.py:
      // cv2.rectangle(img, (x,y), (x+w,y+h), (0,255,0), 2)
      const boxW = 200;
      const boxH = 240;
      const boxX = (canvas.width - boxW) / 2;
      const boxY = (canvas.height - boxH) / 2;

      // Color scheme based on state
      const color = scanStatus === 'success' 
        ? '#10b981' 
        : scanStatus === 'scanning' 
        ? '#00f0ff' 
        : scanStatus === 'failed' 
        ? '#ef4444' 
        : '#06b6d4';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      // Main face target rectangle
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Corner target brackets
      const bracketLen = 20;
      ctx.lineWidth = 3;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(boxX - 5, boxY + bracketLen);
      ctx.lineTo(boxX - 5, boxY - 5);
      ctx.lineTo(boxX + bracketLen, boxY - 5);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW + 5 - bracketLen, boxY - 5);
      ctx.lineTo(boxX + boxW + 5, boxY - 5);
      ctx.lineTo(boxX + boxW + 5, boxY + bracketLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(boxX - 5, boxY + boxH - bracketLen);
      ctx.lineTo(boxX - 5, boxY + boxH + 5);
      ctx.lineTo(boxX + bracketLen, boxY + boxH + 5);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW + 5 - bracketLen, boxY + boxH + 5);
      ctx.lineTo(boxX + boxW + 5, boxY + boxH + 5);
      ctx.lineTo(boxX + boxW + 5, boxY + boxH + 5 - bracketLen);
      ctx.stroke();

      // Moving Laser Scan Line
      if (scanStatus === 'scanning') {
        scanY += 3 * scanDirection;
        if (scanY > boxH) scanDirection = -1;
        if (scanY < 0) scanDirection = 1;

        const grad = ctx.createLinearGradient(boxX, boxY + scanY, boxX, boxY + scanY + 8);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(boxX, boxY + scanY, boxW, 8);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + scanY);
        ctx.lineTo(boxX + boxW, boxY + scanY);
        ctx.stroke();
      }

      // Metadata labels matching OpenCV:
      // cv2.putText(img, str(id), (x+5,y-5), font, 1, (255,255,255), 2)
      // cv2.putText(img, str(accuracy), (x+5,y+h-5), font, 1, (255,255,0), 1)
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`TARGET: ${detectedUser}`, boxX + 6, boxY - 10);

      ctx.fillStyle = scanStatus === 'success' ? '#34d399' : '#38bdf8';
      ctx.fillText(`LBPH CONFIDENCE: ${matchConfidence}%`, boxX + 6, boxY + boxH + 20);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [scanStatus, detectedUser, matchConfidence]);

  // Initiate Biometric Face Recognition (recreates wakeUpJARVIS trigger)
  const triggerScan = () => {
    setScanStatus('scanning');
    setScanProgress(0);
    setDetectedUser('ANALYZING...');
    soundFX.playClick(900);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          completeScan();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const completeScan = () => {
    // Optical Face Recognition Done: match master user Gaurav
    const userName = 'Gaurav';
    const confidence = 96;
    setDetectedUser(userName);
    setMatchConfidence(confidence);
    setScanStatus('success');
    soundFX.playAccessGranted();

    const welcomeMsg = "Optical Face Recognition Done. Welcome Gaurav SIR. Systems fully online.";
    speechEngine.speak(welcomeMsg, () => {
      onAuthenticated(userName);
    });
  };

  const handleManualOverride = () => {
    soundFX.playClick(1100);
    completeScan();
  };

  const handleTrainModel = () => {
    setIsTraining(true);
    setTrainingSamples(0);
    soundFX.playClick(750);
    const trainInterval = setInterval(() => {
      setTrainingSamples((prev) => {
        if (prev >= 30) {
          clearInterval(trainInterval);
          setIsTraining(false);
          soundFX.playAccessGranted();
          speechEngine.speak("LBPH Model Trained Successfully with 30 facial samples.");
          return 30;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan relative overflow-hidden backdrop-blur-md">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h2 className="font-hud text-sm sm:text-base font-bold tracking-wider text-cyan-300">
            OPTICAL FACE RECOGNITION (LBPH)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[11px] font-code rounded border ${
            isUnlocked 
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40' 
              : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
          }`}>
            {isUnlocked ? 'AUTHORIZED' : 'ACCESS RESTRICTED'}
          </span>
        </div>
      </div>

      {/* Camera / HUD Container */}
      <div className="relative w-full max-w-lg mx-auto aspect-4/3 bg-slate-950 rounded-lg overflow-hidden border border-cyan-500/30 flex items-center justify-center">
        {/* Real Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'} scale-x-[-1]`}
        />

        {/* Fallback synthetic visual if webcam not active */}
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-4 text-center">
            <img 
              src="/images/face-600x900.png" 
              alt="Biometric Face Model" 
              className="w-36 h-48 object-cover rounded opacity-40 mix-blend-screen mb-2"
              onError={(e) => {
                // fallback to jarvis.jpg if face not found
                (e.target as HTMLImageElement).src = '/jarvis1.jpg';
              }}
            />
            <p className="font-code text-xs text-cyan-300/80">SYNTHETIC OPTICAL SENSOR READY</p>
            {cameraError && <p className="text-[10px] text-amber-400 mt-1 max-w-xs">{cameraError}</p>}
          </div>
        )}

        {/* HUD Interactive Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Scan Progress Bar Overlay */}
        {scanStatus === 'scanning' && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-950/80 p-2 rounded border border-cyan-500/40">
            <div className="flex justify-between text-xs font-code text-cyan-300 mb-1">
              <span>SCANNING HAAR CASCADE FRAMES...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-150"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Controls & Training Tools */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={triggerScan}
          disabled={scanStatus === 'scanning'}
          className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 rounded-lg text-cyan-300 font-hud text-xs tracking-wider transition-all disabled:opacity-50"
        >
          <Camera className="w-4 h-4 text-cyan-400" />
          {scanStatus === 'scanning' ? 'SCANNING...' : 'SCAN FACE AUTH'}
        </button>

        <button
          onClick={handleTrainModel}
          disabled={isTraining}
          className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-600 rounded-lg text-slate-300 font-hud text-xs tracking-wider transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${isTraining ? 'animate-spin' : ''}`} />
          {isTraining ? `TRAINING (${trainingSamples}/30)` : 'RETRAIN SAMPLES'}
        </button>

        <button
          onClick={isUnlocked ? onLockAgain : handleManualOverride}
          className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-400/50 rounded-lg text-blue-200 font-hud text-xs tracking-wider transition-all"
        >
          {isUnlocked ? (
            <>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              LOCK SYSTEM
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 text-emerald-400" />
              MASTER BYPASS
            </>
          )}
        </button>
      </div>

      {/* Technical Spec Footer from original repo */}
      <div className="mt-4 pt-3 border-t border-cyan-950 flex flex-wrap items-center justify-between text-[11px] font-code text-slate-400">
        <div>Classifier: <span className="text-cyan-300">haarcascade_frontalface_default.xml</span></div>
        <div>Model: <span className="text-cyan-300">LBPH (trainer.yml)</span></div>
        <div>User DB: <span className="text-cyan-300">ID 1: Gaurav (Master)</span></div>
      </div>
    </div>
  );
};
