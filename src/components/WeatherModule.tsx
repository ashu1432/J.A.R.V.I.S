import React, { useEffect, useState } from 'react';
import { CloudRain, Compass, Droplets, MapPin, Navigation, RefreshCw, Thermometer, Volume2, Wind } from 'lucide-react';
import { DEFAULT_WEATHER } from '../data/mockData';
import { WeatherReport } from '../types/jarvis';
import { soundFX } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

export const WeatherModule: React.FC = () => {
  const [weather, setWeather] = useState<WeatherReport>(DEFAULT_WEATHER);
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState('New Delhi / Malibu HQ');

  const fetchLiveWeather = (lat: number, lon: number) => {
    setIsLoading(true);
    soundFX.playRadarPing();

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current) {
          const cur = data.current;
          const code = cur.weather_code;
          let condition = 'Clear Sky';
          if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
          else if (code >= 51 && code <= 67) condition = 'Rain / Showers';
          else if (code >= 71 && code <= 77) condition = 'Snow';
          else if (code >= 80 && code <= 82) condition = 'Heavy Rain';
          else if (code >= 95) condition = 'Thunderstorm';

          setWeather({
            city: locationName,
            country: 'Earth',
            lat: Number(lat.toFixed(4)),
            lon: Number(lon.toFixed(4)),
            temp: cur.temperature_2m,
            humidity: cur.relative_humidity_2m,
            windSpeed: cur.wind_speed_10m,
            condition,
            description: `Wind speed is ${cur.wind_speed_10m} m/s with ${cur.relative_humidity_2m}% atmospheric humidity.`
          });
        }
      })
      .catch(() => {
        // keep fallback weather
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDetectLocation = () => {
    soundFX.playClick(900);
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLocationName(`Coordinates: ${lat.toFixed(2)}N, ${lon.toFixed(2)}E`);
          fetchLiveWeather(lat, lon);
        },
        () => {
          setIsLoading(false);
          // Use default coordinates
          fetchLiveWeather(28.6139, 77.2090);
        }
      );
    } else {
      fetchLiveWeather(28.6139, 77.2090);
    }
  };

  useEffect(() => {
    fetchLiveWeather(weather.lat, weather.lon);
  }, []);

  const speakWeatherReport = () => {
    soundFX.playClick(850);
    // Exact speech phrasing from helpers.py line 69-75:
    const speech = `${weather.lat} latitude, ${weather.lon} longitude. Current location is ${weather.city}. Weather type ${weather.condition}. Wind speed is ${weather.windSpeed} metre per second. Temperature: ${weather.temp} degree celcius. Humidity is ${weather.humidity} percent.`;
    speechEngine.speak(speech);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 glow-cyan flex flex-col backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-400" />
          <h2 className="font-hud text-sm sm:text-base font-bold tracking-wider text-cyan-300">
            ATMOSPHERIC & GEOLOCATION RADAR
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDetectLocation}
            disabled={isLoading}
            className="cursor-pointer p-1.5 rounded bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">RADAR SYNC</span>
          </button>
          <button
            onClick={speakWeatherReport}
            className="cursor-pointer px-2.5 py-1 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/40 rounded text-cyan-200 text-xs font-hud flex items-center gap-1"
          >
            <Volume2 className="w-3.5 h-3.5" /> SPEAK REPORT
          </button>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Temperature */}
        <div className="p-3 bg-slate-950/80 rounded-lg border border-cyan-950 flex flex-col">
          <div className="flex items-center gap-1 text-[11px] font-code text-cyan-400 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>TEMPERATURE</span>
          </div>
          <span className="font-hud text-xl sm:text-2xl font-bold text-cyan-200">
            {weather.temp}°C
          </span>
          <span className="text-[10px] font-code text-slate-400 mt-1">Celsius scale</span>
        </div>

        {/* Condition */}
        <div className="p-3 bg-slate-950/80 rounded-lg border border-cyan-950 flex flex-col">
          <div className="flex items-center gap-1 text-[11px] font-code text-cyan-400 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONDITION</span>
          </div>
          <span className="font-hud text-sm sm:text-base font-bold text-cyan-200 truncate">
            {weather.condition}
          </span>
          <span className="text-[10px] font-code text-slate-400 mt-1">Atmosphere</span>
        </div>

        {/* Humidity */}
        <div className="p-3 bg-slate-950/80 rounded-lg border border-cyan-950 flex flex-col">
          <div className="flex items-center gap-1 text-[11px] font-code text-cyan-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>HUMIDITY</span>
          </div>
          <span className="font-hud text-xl sm:text-2xl font-bold text-cyan-200">
            {weather.humidity}%
          </span>
          <span className="text-[10px] font-code text-slate-400 mt-1">Moisture index</span>
        </div>

        {/* Wind Speed */}
        <div className="p-3 bg-slate-950/80 rounded-lg border border-cyan-950 flex flex-col">
          <div className="flex items-center gap-1 text-[11px] font-code text-cyan-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>WIND SPEED</span>
          </div>
          <span className="font-hud text-xl sm:text-2xl font-bold text-cyan-200">
            {weather.windSpeed} <span className="text-xs font-normal">m/s</span>
          </span>
          <span className="text-[10px] font-code text-slate-400 mt-1">Surface velocity</span>
        </div>
      </div>

      {/* Geolocation Radar Bar */}
      <div className="p-3 bg-slate-950/80 rounded-lg border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-code">
        <div className="flex items-center gap-2 text-cyan-300">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Coordinates: {weather.lat}° N, {weather.lon}° E</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`https://maps.google.com/?q=${weather.lat},${weather.lon}`}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:text-cyan-200 underline text-[11px] flex items-center gap-1"
          >
            <Compass className="w-3 h-3" /> Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};
