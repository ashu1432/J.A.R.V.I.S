import React, { useState } from 'react';
import { Mail, Send, X, CheckCircle2 } from 'lucide-react';
import { soundFX } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: string;
  defaultContent?: string;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  defaultRecipient = 'gauravsingh9356@gmail.com',
  defaultContent = 'Gaurav is a good boy'
}) => {
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [content, setContent] = useState(defaultContent);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick(900);
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      soundFX.playAccessGranted();
      speechEngine.speak("Email has been sent successfully, Sir!");

      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 1800);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-xl p-5 w-full max-w-md glow-cyan relative text-slate-100">
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h3 className="font-hud text-sm font-bold text-cyan-300">
              SMTP EMAIL PROTOCOL (GMAIL DISPATCH)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-cyan-300 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSent ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
            <h4 className="font-hud text-emerald-300 font-bold text-base">EMAIL TRANSMITTED</h4>
            <p className="text-xs font-code text-slate-400 mt-1">SMTP 587 Handshake verified.</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3 font-code text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Recipient Address:</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                className="w-full bg-slate-950 border border-cyan-500/30 rounded px-3 py-2 text-cyan-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Message Content (What I say, Sir):</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full bg-slate-950 border border-cyan-500/30 rounded px-3 py-2 text-cyan-200 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer px-3 py-1.5 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="cursor-pointer px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-hud font-bold rounded flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'DISPATCHING...' : 'SEND EMAIL'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
