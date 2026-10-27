# J.A.R.V.I.S (Just A Rather Very Intelligent System) - React Edition

A web-based AI assistant and futuristic Iron Man holographic HUD rewritten from the original Python assistant repository into a modern React + TypeScript + Vite application.

![J.A.R.V.I.S HUD](jarvis1.jpg)

## Features Ported & Engineered

1. **Neural Voice & Conversational Assistant**:
   - Web Speech API integration with real-time speech recognition (mic input) and text-to-speech voice synthesis.
   - Persona switcher: toggle between **J.A.R.V.I.S** (authoritative British male voice) and **F.R.I.D.A.Y** (tactical female voice).
   - Conversational command engine with natural language intent detection:
     - *"Jarvis are you there?"* -> Status verification
     - *"Who made you?"* / *"Your master"* -> Creator acknowledgement (Gaurav / Master)
     - *"What does J.A.R.V.I.S stand for?"* -> Acronym explanation
     - *"What is the time?"* -> System clock readout
     - *"Check CPU & battery"* -> Live hardware diagnostics
     - *"Tell me a joke"* -> PyJokes programming humor generator
     - *"Search Wikipedia [topic]"* -> Wikipedia summary extractor
     - *"Take a screenshot"* -> Screen display snapshot
     - Fast command bar and direct execution chips

2. **Optical Face Recognition & Biometric Access (LBPH + Haar Cascade)**:
   - Live camera stream with biometric facial target reticle and laser sweep overlay.
   - LBPH confidence score calculation and master user recognition ("Gaurav").
   - Training sample generator preview (30 samples) and manual bypass mode.

3. **Intelligent Sensing Dictionary with Typo Correction**:
   - Word definitions powered by local lexicon dataset and dictionary API.
   - Levenshtein distance typo detection (re-implementing Python's `difflib.get_close_matches`).
   - "Did you mean [Suggestion]?" interactive verification and speech recitation.

4. **Intelligence & News Feed**:
   - Headlining news feed inspired by The Times Of India.
   - Broadcast audio mode reading headlines sequentially with voice synthesis.

5. **Atmospheric & Geolocation Radar**:
   - Open-Meteo live API integration with GPS coordinates.
   - Temperature (°C), humidity (%), wind speed (m/s), and atmospheric condition report.
   - Direct Google Maps coordinate navigation.

6. **YouTube Stream Downloader**:
   - Re-implementation of the original PyTube Tkinter desktop GUI in React.
   - Video metadata inspector (author, duration, views in millions, file size in MB).
   - Download progress simulation with percentage updates and MP4/MP3 format selector.

7. **Optical Character Recognition (OCR Scanner)**:
   - Computer vision OCR scanner inspired by `OCR.py` (Tesseract + OpenCV).
   - Green bounding boxes around recognized text with confidence scores.
   - Image upload and sample blueprints analysis with text-to-speech readout.

8. **Amazon Price Radar & Email Alert**:
   - Monitored product tracker (WOW Skin Science Face Wash from `amazon.py`).
   - Price drop threshold monitoring and automated SMTP email dispatch simulation.

9. **Persistent Memory Vault (`data.txt`)**:
   - Remembers user notes (initialized with *"I have to wake up early in the morning"*).
   - Add, delete, and recall memories via voice or interface.

10. **System Telemetry & Hardware Diagnostics (`psutil`)**:
    - CPU load meter, battery gauge with charging status, RAM buffer, and operating system detection.

## Tech Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Holographic HUD shaders & animations
- **Audio & Speech**: Web Audio API Sound Synthesizer, Web Speech API (SpeechRecognition & SpeechSynthesis)
- **Icons**: Lucide React

## Running the Application

```bash
npm install
npm run dev
```

Dev server starts on `http://0.0.0.0:3000`.
