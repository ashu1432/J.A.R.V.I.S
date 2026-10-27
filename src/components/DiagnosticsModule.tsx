import React, { useEffect, useState } from 'react';
import { Cpu, Battery, Activity, HardDrive, ShieldCheck, Volume2, RefreshCw } from 'lucide-react';
import { SystemTelemetry } from '../types/jarvis';
import { soundFX } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

export const DiagnosticsModule: React.FC = () => {
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    cpuUsage: 28,
    memoryUsage: 45,
    batteryLevel: 92,
    isCharging: true,
    temperature: 42,
    cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8,
    platform: typeof navigator !== 'undefined' ? navigator.userAgent.includes('Mac') ? 'Darwin (macOS)' : navigator.userAgent.includes('Win') ? 'Windows 11' : 'Linux x86_64' : 'Linux',
    uptimeSeconds: 3840
  });

  useEffect(() => {
    // Attempt real battery detection
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setTelemetry((prev) => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100),
          isCharging: battery.charging
        }));

        battery.addEventListener('levelchange', () => {
          setTelemetry((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100)
          }));
        });
      }).catch(() => {});
    }

    // Dynamic telemetry simulation
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const jitter = (Math.random() - 0.5) * 6;
        const newCpu = Math.max(12, Math.min(88, Math.round(prev.cpuUsage + jitter)));
        const newMem = Math.max(30, Math.min(75, Math.round(prev.memoryUsage + (Math.random() - 0.5) * 2)));
        return {
          ...prev,
          cpuUsage: newCpu,
          memoryUsage: newMem,
          uptimeSeconds: prev.uptimeSeconds + 3
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const speakDiagnostics = () => {
    soundFX.playClick(900);
    // Exact phrasing from helpers.py line 28-32:
    speechEngine.speak(`CPU is at ${telemetry.cpuUsage} percent. Battery is at ${telemetry.batteryLevel} percent.`);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan flex flex-col backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="font-hud text-sm sm:text-base font-bold tracking-wider text-cyan-300">
            SYSTEM TELEMETRY (PSUTIL DIAGNOSTICS)
          </h2>
        </div>
        <button
          onClick={speakDiagnostics}
          className="cursor-pointer px-3 py-1 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/50 rounded text-cyan-200 text-xs font-hud flex items-center gap-1.5"
        >
          <Volume2 className="w-3.5 h-3.5" /> SPEAK CPU & BATTERY
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* CPU */}
        <div className="p-3.5 bg-slate-950/80 rounded-lg border border-cyan-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-code text-cyan-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> CPU LOAD
            </span>
            <span>{telemetry.cores} CORES</span>
          </div>
          <div className="font-hud text-3xl font-bold text-cyan-200 mb-2">
            {telemetry.cpuUsage}%
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-500"
              style={{ width: `${telemetry.cpuUsage}%` }}
            />
          </div>
        </div>

        {/* Battery */}
        <div className="p-3.5 bg-slate-950/80 rounded-lg border border-cyan-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-code text-cyan-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Battery className="w-4 h-4" /> BATTERY LEVEL
            </span>
            <span className="text-[10px] text-emerald-400">
              {telemetry.isCharging ? 'CHARGING' : 'BATTERY'}
            </span>
          </div>
          <div className="font-hud text-3xl font-bold text-emerald-400 mb-2">
            {telemetry.batteryLevel}%
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${telemetry.batteryLevel}%` }}
            />
          </div>
        </div>

        {/* Memory */}
        <div className="p-3.5 bg-slate-950/80 rounded-lg border border-cyan-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-code text-cyan-400 mb-2">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4" /> RAM BUFFER
            </span>
            <span className="text-[10px] text-slate-400">VIRTUAL</span>
          </div>
          <div className="font-hud text-3xl font-bold text-cyan-200 mb-2">
            {telemetry.memoryUsage}%
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-500"
              style={{ width: `${telemetry.memoryUsage}%` }}
            />
          </div>
        </div>
      </div>

      {/* OS & Host metadata matching sys.platform in jarvis.py */}
      <div className="p-3 bg-slate-950/80 rounded-lg border border-cyan-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-code text-slate-300">
        <div>
          <span className="text-[10px] text-slate-500 block">HOST RUNTIME:</span>
          <span className="text-cyan-300">{telemetry.platform}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">HARDWARE CORES:</span>
          <span className="text-cyan-300">{telemetry.cores} Logical CPUs</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">SECURITY LAYER:</span>
          <span className="text-emerald-400">LBPH Active</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">UPTIME:</span>
          <span className="text-cyan-300">{Math.floor(telemetry.uptimeSeconds / 60)} mins</span>
        </div>
      </div>
    </div>
  );
};
