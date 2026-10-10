import React, { useState, useEffect } from 'react';
import { AlertTriangle, Flame, ShieldAlert, PhoneCall, Moon, Compass, Volume2, Settings, Download, Smartphone, X } from 'lucide-react';
import { speakAunty, getRandomAuntyLine, sounds } from '../utils/audio';

export default function Header({ 
  state, 
  onToggleWorkMode, 
  onToggleVolunteeringMode,
  onOpenPanic,
  onOpenDoomScroll,
  onOpenEveningCheckin,
  onOpenAppeals,
  onOpenSettings,
  onToggleGrayscale,
  onToggleClown
}) {
  const { user } = state;
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        sounds.playSuccess();
        speakAunty("Chakam installed! No excuses now, I am inside your phone!");
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleQuickAuntySpeech = () => {
    sounds.playStrike();
    speakAunty(getRandomAuntyLine());
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
      {/* Top Warning Banner if Clown or High Strikes */}
      {user.clownMode && (
        <div className="mb-2.5 p-2 bg-red-600/20 border border-red-500 rounded-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400">
            <span className="text-xl">🤡</span>
            <span>CLOWN MODE ACTIVE: You dey play! Task missed.</span>
          </div>
          <button 
            onClick={onToggleClown}
            className="text-[11px] bg-red-600 text-white font-bold px-2 py-0.5 rounded hover:bg-red-500"
          >
            Resolve
          </button>
        </div>
      )}

      {/* Main Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-700 to-neutral-900 border border-red-500/40 flex items-center justify-center shadow-lg shadow-red-950/50">
              <span className="text-xl font-black">{user.clownMode ? '🤡' : '🚨'}</span>
            </div>
            {user.strikeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-neutral-950">
                {user.strikeCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                Chakam!
                <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                  Snitch App
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium truncate max-w-[190px]">
              {user.name} • {user.role.split('&')[0]}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Voice Line Button */}
          <button 
            onClick={handleQuickAuntySpeech}
            title="Hear Aunty Chakam voice"
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-red-500 active:scale-95 transition-all"
          >
            <Volume2 className="w-4 h-4 text-red-400" />
          </button>

          {/* Panic Reality Check */}
          <button
            onClick={onOpenPanic}
            className="flex items-center gap-1 text-xs font-bold bg-red-600/20 border border-red-500/50 text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-all active:scale-95"
            title="Instant roast and reality check"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Aunty</span> Panic
          </button>

          {/* Pause Doomscroll */}
          <button
            onClick={onOpenDoomScroll}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 active:scale-95 transition-all"
            title="Pause before doomscrolling"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Evening Checkin */}
          <button
            onClick={onOpenEveningCheckin}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 active:scale-95 transition-all"
            title="Evening Check-in: What stopped you?"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Install App on Phone */}
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 text-xs font-bold bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-600 hover:text-white px-2 py-1.5 rounded-lg active:scale-95 transition-all"
            title="Install App onto Phone Home Screen"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install</span>
          </button>

          {/* Settings & Friends Details */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-red-500/50 active:scale-95 transition-all"
            title="Settings & Edit Friends Details"
          >
            <Settings className="w-4 h-4 text-neutral-300" />
          </button>
        </div>
      </div>

      {/* Mode Switches & Strikes Strip */}
      <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {/* Work Day Mode Toggle */}
          <button
            onClick={onToggleWorkMode}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border ${
              user.workDayMode 
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/20' 
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            🏥 Work Shift {user.workDayMode ? 'ON' : 'OFF'}
          </button>

          {/* Volunteering Mode */}
          <button
            onClick={onToggleVolunteeringMode}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border ${
              user.volunteeringDayMode 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20' 
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            🤝 Volunteer Day
          </button>

          {/* Grayscale Mode Toggle */}
          <button
            onClick={onToggleGrayscale}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all border ${
              user.grayscaleMode
                ? 'bg-neutral-700 text-white border-neutral-500'
                : 'bg-neutral-900 text-neutral-500 border-neutral-800'
            }`}
            title="Grayscale punishment toggle"
          >
            ◐ Gray
          </button>
        </div>

        {/* Strike Meter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Strikes:
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <span
                key={lvl}
                className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center border transition-all ${
                  user.strikeCount >= lvl
                    ? 'bg-red-600 border-red-500 text-white shadow-xs shadow-red-500/40'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                }`}
                title={`Level ${lvl} Strike`}
              >
                {lvl}
              </span>
            ))}
          </div>
          <button
            onClick={onOpenAppeals}
            className="text-[10px] text-amber-400 font-bold ml-1 hover:underline underline-offset-2"
          >
            Appeal
          </button>
        </div>
      </div>

      {/* INSTALL GUIDE MODAL */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-neutral-900 border-2 border-emerald-500 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </span>
                <h3 className="text-sm font-black text-white">Install Chakam on Phone</h3>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-full bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black">1.</span> On Android (Google Chrome):
                </p>
                <p className="text-[11px] text-neutral-400">
                  Tap the <strong className="text-white">3 dots (⋮)</strong> at the top right of your browser, then tap <strong className="text-emerald-400">"Install app"</strong> or <strong className="text-emerald-400">"Add to Home screen"</strong>.
                </p>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black">2.</span> On iPhone (Safari):
                </p>
                <p className="text-[11px] text-neutral-400">
                  Tap the <strong className="text-white">Share button (⎋)</strong> at the bottom bar, then scroll down and tap <strong className="text-emerald-400">"Add to Home Screen"</strong>.
                </p>
              </div>

              <p className="text-[10px] text-neutral-500 italic text-center">
                Once installed, Chakam runs full-screen with its own app icon and offline habits support!
              </p>

              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
