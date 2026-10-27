import React, { useState } from 'react';
import { ShoppingBag, TrendingDown, Bell, Mail, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
import { soundFX } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

export const AmazonTrackerModule: React.FC = () => {
  const [currentPrice, setCurrentPrice] = useState<number>(349.0);
  const [originalPrice] = useState<number>(499.0);
  const [targetPrice, setTargetPrice] = useState<number>(300.0);
  const [emailRecipient, setEmailRecipient] = useState<string>('mouryaajay637@gmail.com');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [emailAlertSent, setEmailAlertSent] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ date: string; price: number }>>([
    { date: 'Oct 20', price: 499 },
    { date: 'Oct 22', price: 449 },
    { date: 'Oct 24', price: 399 },
    { date: 'Oct 27', price: 349 }
  ]);

  const productUrl = 'https://www.amazon.in/WOW-Brightening-Vitamin-Face-Wash/dp/B07SZ243VZ';

  const checkPrice = (forceDrop = false) => {
    setIsChecking(true);
    soundFX.playClick(850);

    setTimeout(() => {
      setIsChecking(false);
      const newPrice = forceDrop ? 279.0 : currentPrice;
      setCurrentPrice(newPrice);

      soundFX.playClick(1000);
      speechEngine.speak(`Current price on Amazon is ${newPrice} rupees.`);

      if (newPrice <= targetPrice) {
        setEmailAlertSent(true);
        soundFX.playAccessGranted();
        speechEngine.speak(`Alert Sir! Price fell down to ${newPrice} rupees. Dispatched email notification to ${emailRecipient}.`);
      }
    }, 800);
  };

  const handleSimulateDrop = () => {
    checkPrice(true);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan flex flex-col backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <h2 className="font-hud text-sm sm:text-base font-bold tracking-wider text-cyan-300">
            AMAZON PRICE RADAR & EMAIL ALERT (AMAZON.PY)
          </h2>
        </div>
        <span className="text-[11px] font-code px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300">
          BEAUTIFUL SOUP 4 SCRAPER
        </span>
      </div>

      {/* Tracked Product Card */}
      <div className="p-4 bg-slate-950/90 rounded-lg border border-cyan-500/30 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
          <div>
            <span className="text-[10px] font-code text-cyan-400 font-bold uppercase">MONITORED ASSET:</span>
            <h3 className="font-hud text-sm sm:text-base font-bold text-slate-100">
              WOW Skin Science Brightening Vitamin C Face Wash
            </h3>
            <p className="text-xs font-code text-slate-400">
              ASIN: B07SZ243VZ • Target URL: Amazon India
            </p>
          </div>
          <a
            href={productUrl}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer text-xs font-code px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition"
          >
            <span>View Amazon</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Pricing Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-slate-900 rounded border border-slate-800">
            <span className="text-[10px] font-code text-slate-400">ORIGINAL PRICE:</span>
            <div className="font-hud text-xl text-slate-400 line-through">₹{originalPrice}</div>
          </div>

          <div className="p-3 bg-slate-900 rounded border border-cyan-500/40">
            <span className="text-[10px] font-code text-cyan-400 font-bold">CURRENT DEAL PRICE:</span>
            <div className="font-hud text-2xl text-emerald-400 font-bold">₹{currentPrice}</div>
            <span className="text-[10px] font-code text-emerald-400">
              {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% Discount Applied
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded border border-amber-500/40">
            <span className="text-[10px] font-code text-amber-400 font-bold">ALERT THRESHOLD:</span>
            <div className="font-hud text-2xl text-amber-300 font-bold">₹{targetPrice}</div>
            <span className="text-[10px] font-code text-slate-400">
              Triggers SMTP dispatch
            </span>
          </div>
        </div>

        {/* Target Price and Email Config */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs font-code">
          <div>
            <label className="block text-slate-400 mb-1">Target Alert Price (₹):</label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-cyan-500/30 rounded px-3 py-1.5 text-cyan-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">SMTP Notification Recipient:</label>
            <input
              type="email"
              value={emailRecipient}
              onChange={(e) => setEmailRecipient(e.target.value)}
              className="w-full bg-slate-900 border border-cyan-500/30 rounded px-3 py-1.5 text-cyan-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => checkPrice(false)}
            disabled={isChecking}
            className="cursor-pointer px-4 py-2 bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-400/50 rounded text-xs font-hud text-cyan-200 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'SCRAPING PRODUCT...' : 'CHECK CURRENT PRICE'}</span>
          </button>

          <button
            onClick={handleSimulateDrop}
            className="cursor-pointer px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/50 rounded text-xs font-hud text-emerald-200 flex items-center gap-2 transition"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>TRIGGER PRICE DROP TEST (₹279)</span>
          </button>
        </div>

        {/* Alert Dispatch Confirmation */}
        {emailAlertSent && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-400 rounded-lg flex items-center gap-3 text-emerald-200 text-xs font-code">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Subject: Price fell down!</span>
              <p>Email alert successfully transmitted to {emailRecipient} via SMTP protocol.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
