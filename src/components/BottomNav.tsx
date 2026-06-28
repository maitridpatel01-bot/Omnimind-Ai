/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "chat", label: "Chat", icon: "forum" },
    { id: "learning", label: "Workspace", icon: "psychology" },
    { id: "research", label: "Research", icon: "explore" },
    { id: "code", label: "Code", icon: "terminal" },
    { id: "startup", label: "Studio", icon: "token" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-3xl border-t border-white/10 px-4 py-2.5 pb-6">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 flex-1"
            >
              <div 
                className={`w-11 h-6 rounded-full flex items-center justify-center transition-all ${
                  isActive 
                    ? "bg-[#d0bcff]/20 text-[#d0bcff]" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </div>
              <span 
                className={`text-[9px] font-mono tracking-tight font-bold uppercase transition-colors ${
                  isActive ? "text-[#d0bcff]" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
