import { NewsArticle, WeatherReport } from '../types/jarvis';

// Authentic pyjokes collection (as imported in helpers.py)
export const PY_JOKES: string[] = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "There are 10 types of people in the world: those who understand binary, and those who don't.",
  "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "Real programmers count from 0.",
  "To understand what recursion is, you must first understand recursion.",
  "Why do Java programmers wear glasses? Because they don't C#.",
  "An optimist says 'The glass is half full'. A pessimist says 'The glass is half empty'. A programmer says 'The glass is twice as large as necessary'.",
  "Hardware: The part of a computer that you can kick; Software: The part you can only curse at.",
  "Chuck Norris can compile syntax errors."
];

// Seed dictionary data (from data.json) with quick lookup
export const SEED_DICTIONARY: Record<string, string[]> = {
  "algorithm": [
    "A step-by-step procedure or formula for solving a problem, especially by a computer."
  ],
  "artificial intelligence": [
    "The simulation of human intelligence processes by machines, especially computer systems."
  ],
  "neural network": [
    "A computing system inspired by the biological neural networks that constitute animal brains."
  ],
  "machine learning": [
    "A branch of artificial intelligence focused on building applications that learn from data and improve their accuracy over time without being programmed to do so."
  ],
  "computer vision": [
    "An interdisciplinary scientific field that deals with how computers can gain high-level understanding from digital images or videos."
  ],
  "jarvis": [
    "Just A Rather Very Intelligent System. An artificial intelligence computer system created to assist Tony Stark and manage Stark Industries systems."
  ],
  "friday": [
    "Female Replacement Intelligent Digital Assistant Youth. Stark Industries AI designed as an alternate tactical voice assistant."
  ],
  "biometrics": [
    "The measurement and statistical analysis of people's unique physical and behavioral characteristics."
  ],
  "cybernetics": [
    "The scientific study of control and communication in the animal and the machine."
  ],
  "arc reactor": [
    "A clean, high-density energy generator utilizing cold fusion technology originally engineered by Howard Stark and miniaturized by Tony Stark."
  ],
  "acid rain": [
    "Rain having a pH less than 5.6 caused by atmospheric pollution."
  ],
  "air pollutant": [
    "Any pollutant agent including physical, chemical, or biological substances emitted into ambient air."
  ],
  "acoustics": [
    "The science of the production, transmission and effects of sound."
  ],
  "biodiversity": [
    "Number and variety of living organisms; includes genetic diversity, species diversity, and ecological diversity."
  ],
  "agriculture": [
    "The production of plants and animals useful to man, involving soil cultivation and the breeding and management of crops."
  ],
  "atmosphere": [
    "The gaseous envelope surrounding the Earth in a several kilometers-thick layer."
  ]
};

// Levenshtein distance for fuzzy matching (re-implementing Python's difflib.get_close_matches)
export function getCloseMatches(word: string, possibilities: string[], n = 3, cutoff = 0.5): string[] {
  word = word.toLowerCase();
  
  function similarity(s1: string, s2: string): number {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    
    // Levenshtein distance
    const costs: number[] = [];
    for (let i = 0; i <= longer.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[shorter.length] = lastValue;
    }
    return (longerLength - costs[shorter.length]) / longerLength;
  }

  const scored = possibilities
    .map(p => ({ item: p, score: similarity(word, p.toLowerCase()) }))
    .filter(res => res.score >= cutoff)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(res => res.item);

  return scored;
}

// Initial news headlines (Source: The Times Of India & Tech Radar)
export const INITIAL_NEWS: NewsArticle[] = [
  {
    title: "Stark Industries Unveils New Quantum Arc Reactor Clean Power Grid",
    source: "The Times Of India",
    snippet: "Next generation sustainable energy arrays deploy zero-emission microgrids across metropolitan sectors.",
    url: "https://timesofindia.indiatimes.com",
    time: "10 mins ago"
  },
  {
    title: "Global AI Voice Systems Achieve Real-Time Multimodal Reasoning",
    source: "The Times Of India",
    snippet: "Next-generation assistants now process visual feeds, live biometric optical streams, and instant natural language.",
    url: "https://timesofindia.indiatimes.com",
    time: "25 mins ago"
  },
  {
    title: "Deep Space Telescope Detects Unprecedented High-Frequency Signals",
    source: "Science Daily",
    snippet: "Astrophysicists record coherent harmonic oscillations from the Perseus galaxy cluster.",
    url: "https://timesofindia.indiatimes.com",
    time: "1 hour ago"
  },
  {
    title: "Autonomous Drone Fleets Complete Urban Environmental Atmospheric Mapping",
    source: "Tech Times",
    snippet: "Real-time humidity, temperature and wind speed sensors create high-resolution climatic models.",
    url: "https://timesofindia.indiatimes.com",
    time: "2 hours ago"
  }
];

// Default weather report (replicates helpers.py weather function)
export const DEFAULT_WEATHER: WeatherReport = {
  city: "Malibu Command Center",
  country: "IN / US",
  lat: 28.6139,
  lon: 77.2090,
  temp: 24.5,
  humidity: 62,
  windSpeed: 4.8,
  condition: "Clear Sky",
  description: "Optimal atmospheric conditions for flight diagnostics and surveillance telemetry."
};
