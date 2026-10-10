import React from 'react';
import { Home, Stethoscope, Scissors, DollarSign, User, Settings, ShieldAlert } from 'lucide-react';

export default function Navigation({ currentTab, onSelectTab, strikeCount, activePunishment }) {
  const tabs = [
    { id: 'HOME', label: 'Home', icon: Home, badge: activePunishment ? '⚠️' : null },
    { id: 'NURSE', label: 'Nurse', icon: Stethoscope },
    { id: 'DESIGNER', label: 'Designer', icon: Scissors },
    { id: 'BUDGET', label: 'Budget', icon: DollarSign },
    { id: 'ME', label: 'Me', icon: User },
    { id: 'SETTINGS_REVIEW', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 pb-safe">
      <div className="max-w-md mx-auto px-1 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 active:scale-90 ${
                isActive 
                  ? 'text-red-500 font-extrabold' 
                  : 'text-neutral-400 hover:text-neutral-200 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-red-500 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 text-[9px] animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'text-red-400 font-bold' : 'text-neutral-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-red-500 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
