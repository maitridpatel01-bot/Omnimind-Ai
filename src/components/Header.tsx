/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LogOut, User, Sparkles, Zap, Bell, Settings, Sun, Moon, Check, Trash2, Trophy, ArrowRight } from "lucide-react";
import { UserProfile, Notification } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onOpenSettings: () => void;
}

export default function Header({
  user,
  onLogout,
  theme,
  onToggleTheme,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onOpenSettings
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const xpPercentage = Math.min(100, Math.round((user.xp / user.xpMax) * 100));

  return (
    <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-3xl border-b border-white/10 py-3.5 px-4 sm:px-6 flex justify-between items-center transition-colors duration-200">
      <div className="flex items-center gap-2 xs:gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] flex items-center justify-center shadow-[0_0_15px_rgba(208,188,255,0.4)]">
          <Sparkles className="w-4 h-4 text-slate-950" />
        </div>
        <div className="hidden xs:block">
          <span className="font-bold text-white text-base tracking-tight font-sans">OmniMind</span>
          <span className="text-[8px] font-mono font-extrabold text-[#4cd7f6] uppercase tracking-widest block -mt-1">PREMIUM</span>
        </div>

        {/* Small Level Badge on Mobile (hidden on sm+) */}
        <div className="flex sm:hidden items-center gap-1 bg-[#d0bcff]/10 border border-[#d0bcff]/20 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#d0bcff]">
          <Trophy className="w-2.5 h-2.5 text-[#d0bcff]" /> Lv.{user.level}
        </div>

        {/* Dynamic XP Progress Bar (Shown on sm+) */}
        <div className="hidden sm:flex ml-2 sm:ml-4 items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 max-w-[150px] xs:max-w-[200px] sm:max-w-xs">
          <div className="flex flex-col">
            <div className="flex justify-between items-center text-[10px] font-bold font-mono">
              <span className="text-[#d0bcff] flex items-center gap-0.5">
                <Trophy className="w-2.5 h-2.5" /> Lv.{user.level}
              </span>
              <span className="text-gray-400 text-[9px] ml-4">{user.xp}/{user.xpMax} XP</span>
            </div>
            <div className="w-24 xs:w-32 sm:w-40 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick streak display */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-[#ffd9e4]">
          <Zap className="w-3 h-3 text-[#f751a1] fill-[#f751a1]" />
          <span>{user.streak || 1} Day Streak</span>
        </div>

        {/* Daylight Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#4cd7f6] transition-all cursor-pointer relative overflow-hidden active:scale-90"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === "dark" ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {theme === "dark" ? <Moon className="w-4.5 h-4.5 text-[#ffd9e4]" /> : <Sun className="w-4.5 h-4.5 text-amber-500" />}
          </motion.div>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowDropdown(false);
            }}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#d0bcff] transition-all cursor-pointer relative active:scale-90"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 mt-2 w-72 xs:w-80 rounded-2xl bg-[#0a0a0f]/95 border border-white/10 backdrop-blur-3xl shadow-2xl p-3 space-y-2 z-50 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#d0bcff]" /> Recent Notifications
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-[10px] font-mono text-gray-500 hover:text-red-400 flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform"
                    >
                      <Trash2 className="w-3 h-3" /> Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 no-scrollbar pr-0.5">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center space-y-1">
                      <p className="text-xs text-gray-400">All caught up!</p>
                      <p className="text-[10px] text-gray-500">No new notifications at this time.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => onMarkNotificationRead(notif.id)}
                        className={`p-2.5 rounded-xl border transition-all text-xs relative cursor-pointer group active:scale-[0.98] ${
                          notif.read
                            ? "bg-white/2 border-white/5 opacity-60"
                            : "bg-[#d0bcff]/5 border-[#d0bcff]/15 hover:bg-[#d0bcff]/8"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className={`font-semibold ${notif.read ? "text-gray-300" : "text-white"}`}>
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 bg-[#d0bcff] rounded-full mt-1.5 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{notif.description}</p>
                        <span className="text-[9px] font-mono text-gray-500 block mt-1">{notif.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Unified Settings Gear Button */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer active:scale-90"
          title="Settings & Support Center"
        >
          <Settings className="w-4.5 h-4.5 animate-hover-spin" />
        </button>

        {/* Profile Avatar Trigger */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifications(false);
            }}
            className="w-9 h-9 rounded-full bg-[#d0bcff]/10 hover:bg-[#d0bcff]/20 border border-[#d0bcff]/20 flex items-center justify-center text-[#d0bcff] font-bold text-sm cursor-pointer active:scale-90 transition-transform"
          >
            {user.name ? user.name[0].toUpperCase() : "A"}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2.5 w-48 rounded-2xl bg-[#0a0a0f]/95 border border-white/10 backdrop-blur-3xl shadow-2xl p-2.5 space-y-1 z-50 text-left"
              >
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="text-xs text-white font-bold truncate">{user.name || "Alex Rivera"}</p>
                  <p className="text-[10px] text-gray-500 font-mono truncate">{user.email || "alex@vapor.ai"}</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Account Settings
                </button>

                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
