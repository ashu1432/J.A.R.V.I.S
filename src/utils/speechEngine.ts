import { VoicePersona } from '../types/jarvis';

// Types for SpeechRecognition
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class JarvisSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private currentPersona: VoicePersona = 'JARVIS';
  private onSpeakingChange?: (isSpeaking: boolean) => void;
  private onListeningChange?: (isListening: boolean) => void;
  private onTranscript?: (text: string, isFinal: boolean) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.setupRecognition();
    }
  }

  public setPersona(persona: VoicePersona) {
    this.currentPersona = persona;
  }

  public getPersona(): VoicePersona {
    return this.currentPersona;
  }

  public setCallbacks(opts: {
    onSpeakingChange?: (isSpeaking: boolean) => void;
    onListeningChange?: (isListening: boolean) => void;
    onTranscript?: (text: string, isFinal: boolean) => void;
  }) {
    this.onSpeakingChange = opts.onSpeakingChange;
    this.onListeningChange = opts.onListeningChange;
    this.onTranscript = opts.onTranscript;
  }

  private setupRecognition() {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.onListeningChange?.(true);
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          if (finalTranscript) {
            this.onTranscript?.(finalTranscript, true);
          } else if (interimTranscript) {
            this.onTranscript?.(interimTranscript, false);
          }
        };

        this.recognition.onerror = () => {
          this.onListeningChange?.(false);
        };

        this.recognition.onend = () => {
          this.onListeningChange?.(false);
        };
      } catch {
        this.recognition = null;
      }
    }
  }

  public startListening() {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {
        try {
          this.recognition.stop();
          this.recognition.start();
        } catch {
          // ignore error
        }
      }
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    try {
      this.synth.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = this.synth.getVoices();

      if (this.currentPersona === 'JARVIS') {
        // Look for male, deep, British English voice like Jarvis (Paul Bettany)
        const jarvisVoice = voices.find(
          (v) =>
            (v.name.includes('Male') || v.name.includes('George') || v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Oliver') || v.name.includes('Guy')) &&
            (v.lang.startsWith('en-GB') || v.lang.startsWith('en'))
        ) || voices.find(v => v.lang.startsWith('en-GB')) || voices.find(v => v.lang.startsWith('en'));

        if (jarvisVoice) utterance.voice = jarvisVoice;
        utterance.pitch = 0.88; // Slightly lower, authoritative pitch
        utterance.rate = 1.0;
      } else {
        // FRIDAY: female voice assistant (Irish / English female)
        const fridayVoice = voices.find(
          (v) =>
            (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen') || v.name.includes('Moira') || v.name.includes('Fiona') || v.name.includes('Zira')) &&
            v.lang.startsWith('en')
        ) || voices.find(v => v.lang.startsWith('en-IE')) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];

        if (fridayVoice) utterance.voice = fridayVoice;
        utterance.pitch = 1.15; // Higher female pitch
        utterance.rate = 1.05;
      }

      utterance.onstart = () => {
        this.onSpeakingChange?.(true);
      };

      utterance.onend = () => {
        this.onSpeakingChange?.(false);
        onEnd?.();
      };

      utterance.onerror = () => {
        this.onSpeakingChange?.(false);
        onEnd?.();
      };

      this.synth.speak(utterance);
    } catch {
      this.onSpeakingChange?.(false);
      onEnd?.();
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.onSpeakingChange?.(false);
    }
  }
}

export const speechEngine = new JarvisSpeechEngine();
