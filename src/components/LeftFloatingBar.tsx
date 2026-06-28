/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Brain, 
  Compass, 
  Terminal, 
  Rocket,
  Timer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
  HelpCircle,
  Menu,
  X
} from "lucide-react";
import { UserProfile } from "../types";

interface LeftFloatingBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  user: UserProfile;
}

export default function LeftFloatingBar({ activeTab, onSelectTab, user }: LeftFloatingBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard, 
      desc: "Performance & stats overview", 
      color: "from-purple-400 to-indigo-500",
      glow: "rgba(168,85,247,0.3)"
    },
    { 
      id: "chat", 
      label: "AI Experts", 
      icon: MessageSquare, 
      desc: "Consult engineering & academic mentors", 
      color: "from-blue-400 to-indigo-600",
      glow: "rgba(59,130,246,0.3)"
    },
    { 
      id: "learning", 
      label: "Notes Sync", 
      icon: Brain, 
      desc: "Active brain & smart maps workspace", 
      color: "from-pink-400 to-rose-600",
      glow: "rgba(244,63,94,0.3)"
    },
    { 
      id: "research", 
      label: "AI Research", 
      icon: Compass, 
      desc: "Read & summarize academic literature", 
      color: "from-emerald-400 to-teal-600",
      glow: "rgba(16,185,129,0.3)"
    },
    { 
      id: "code", 
      label: "Sandbox IDE", 
      icon: Terminal, 
      desc: "Compile and debug TypeScript", 
      color: "from-amber-400 to-orange-500",
      glow: "rgba(245,158,11,0.3)"
    },
    { 
      id: "startup", 
      label: "Startup Studio", 
      icon: Rocket, 
      desc: "Launch career & startup blueprints", 
      color: "from-cyan-400 to-[#4cd7f6]",
      glow: "rgba(76,215,246,0.3)"
    },
    { 
      id: "focus", 
      label: "Focus Mode", 
      icon: Timer, 
      desc: "Pomodoro timer & ambient soundscapes", 
      color: "from-rose-400 to-[#f751a1]",
      glow: "rgba(247,81,161,0.3)"
    }
  ];

  const activeIndex = navItems.findIndex(item => item.id === activeTab);
  const xpPercentage = Math.min(100, Math.round((user.xp / user.xpMax) * 100));

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 left-3 sm:left-5 ${
        isExpanded ? "w-72" : "w-16"
      }`}
      id="left-floating-bar-container"
    >
      {/* Sleek Floating Capsule */}
      <div className="relative w-full rounded-3xl bg-[#07070a]/80 backdrop-blur-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] p-2.5 flex flex-col gap-4 items-center">
        
        {/* Glow accent effect behind the capsule */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-white/2 to-transparent opacity-50 pointer-events-none" />

        {/* Collapsible Toggler Tag */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-6 w-6.5 h-6.5 rounded-full bg-slate-900 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-all z-20 hover:border-white/20"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          id="btn-sidebar-collapse-toggle"
        >
          {isExpanded ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Brand Header Display (only when expanded) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full text-center px-2 pt-2 border-b border-white/5 pb-3.5 overflow-hidden flex flex-col items-center gap-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] flex items-center justify-center shadow-[0_0_12px_rgba(208,188,255,0.3)]">
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                </div>
                <span className="font-extrabold text-white text-sm tracking-tight font-sans block">
                  OMNIMIND AI
                </span>
              </div>
              <span className="text-[9px] font-mono font-extrabold text-[#4cd7f6] uppercase tracking-widest">
                PREMIUM WORKSPACE
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation list */}
        <nav className="w-full flex flex-col gap-1.5 relative py-1" id="nav-floating-dock">
          
          {/* Animated sliding focus background - glides beautifully behind active icon */}
          <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none z-0">
            {activeIndex !== -1 && (
              <motion.div
                layoutId="active-nav-indicator"
                className="absolute left-0 right-0 rounded-2xl bg-white/5 border border-white/10"
                style={{
                  height: "48px",
                  top: `${activeIndex * 48 + activeIndex * 6 + 4}px`
                }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              >
                {/* Neon side strip highlight */}
                <div 
                  className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md bg-gradient-to-b ${
                    navItems[activeIndex].color
                  } shadow-[0_0_12px_${navItems[activeIndex].glow}]`}
                />
              </motion.div>
            )}
          </div>

          {/* Render individual nav items */}
          {navItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;

            return (
              <div
                key={item.id}
                className="relative group w-full"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`relative w-full h-12 rounded-2xl flex items-center transition-all z-10 cursor-pointer active:scale-95 ${
                    isExpanded ? "px-3 justify-start gap-3.5" : "justify-center"
                  } ${
                    isActive 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  {/* Icon with beautiful gradient highlight on active */}
                  <div className="relative">
                    <IconComponent 
                      className={`w-5 h-5 transition-all duration-300 ${
                        isActive 
                          ? "scale-110" 
                          : "group-hover:scale-110 text-gray-400 group-hover:text-gray-200"
                      }`} 
                      style={{
                        filter: isActive ? `drop-shadow(0 0 6px ${item.glow})` : 'none'
                      }}
                    />
                    
                    {/* Tiny notification/active dot */}
                    {isActive && !isExpanded && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#d0bcff] shadow-[0_0_8px_rgba(208,188,255,0.8)]" />
                    )}
                  </div>

                  {/* Expandable Label Details */}
                  {isExpanded && (
                    <div className="text-left flex flex-col justify-center overflow-hidden">
                      <span className={`text-[12px] font-bold leading-tight ${isActive ? "text-white" : "text-gray-200"}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium truncate tracking-tight">
                        {item.desc}
                      </span>
                    </div>
                  )}
                </button>

                {/* Sliding Horizontal Tooltip for Collapsed view */}
                {!isExpanded && (
                  <div 
                    className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap"
                  >
                    <div className="px-3 py-1.5 rounded-xl bg-[#0a0a0f] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col text-left">
                      <span className="text-xs font-extrabold text-white">{item.label}</span>
                      <span className="text-[9px] text-gray-500 font-mono font-medium">{item.desc}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Miniature Stats Widget (only when expanded) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full bg-white/3 border border-white/5 rounded-2xl p-3.5 mt-2 flex flex-col gap-2 overflow-hidden text-left"
            >
              <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                <span className="text-[#d0bcff] flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-[#d0bcff]" /> Lv.{user.level}
                </span>
                <span className="text-gray-500 text-[9px]">{user.xp}/{user.xpMax} XP</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6]"
                />
              </div>

              {/* Streak Badge */}
              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-[#ffd9e4]">
                <Zap className="w-3.5 h-3.5 text-[#f751a1] fill-[#f751a1]" />
                <span>{user.streak || 1} Day Streak</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tiny Help Info Indicator at the bottom */}
        <div className="pt-2 border-t border-white/5 w-full flex justify-center">
          <HelpCircle 
            className="w-4 h-4 text-gray-500 hover:text-white transition-colors cursor-pointer" 
            title="OmniMind Knowledge Network Guide"
          />
        </div>

      </div>
    </div>
  );
}
