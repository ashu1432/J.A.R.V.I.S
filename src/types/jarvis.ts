export type VoicePersona = 'JARVIS' | 'FRIDAY';

export type ActiveModule = 
  | 'dashboard'
  | 'face_auth'
  | 'voice_terminal'
  | 'dictionary'
  | 'news'
  | 'weather'
  | 'youtube_dl'
  | 'ocr_vision'
  | 'amazon_tracker'
  | 'memory'
  | 'diagnostics';

export interface SystemTelemetry {
  cpuUsage: number;
  memoryUsage: number;
  batteryLevel: number;
  isCharging: boolean;
  temperature: number;
  cores: number;
  platform: string;
  uptimeSeconds: number;
}

export interface MemoryEntry {
  id: string;
  text: string;
  timestamp: string;
}

export interface NewsArticle {
  title: string;
  source: string;
  snippet: string;
  url: string;
  time: string;
}

export interface WeatherReport {
  city: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
}

export interface DictionaryEntry {
  word: string;
  definitions: string[];
  phonetic?: string;
  synonyms?: string[];
  didYouMean?: string;
}

export interface YouTubeDownloadState {
  url: string;
  title: string;
  author: string;
  lengthMinutes: number;
  viewsMillions: number;
  fileSizeMb: number;
  progress: number;
  status: 'idle' | 'fetching' | 'downloading' | 'completed' | 'error';
  errorMessage?: string;
}

export interface OCRScanResult {
  text: string;
  confidence: number;
  boxes: Array<{ x: number; y: number; w: number; h: number; text: string }>;
  imagePreviewUrl?: string;
}

export interface AmazonProductState {
  title: string;
  url: string;
  currentPrice: number;
  originalPrice: number;
  targetPrice: number;
  lastChecked: string;
  status: 'monitoring' | 'price_drop' | 'stable';
  emailAlertRecipient: string;
  emailAlertSent: boolean;
}

export interface VoiceCommandLog {
  id: string;
  timestamp: string;
  sender: 'user' | 'jarvis';
  text: string;
  actionTaken?: string;
}
