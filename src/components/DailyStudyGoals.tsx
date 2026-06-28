/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Edit2, 
  Check, 
  Award, 
  Flame, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Brain, 
  Bell, 
  BellOff, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  AlertTriangle 
} from "lucide-react";
import { UserProfile, Note } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DailyStudyGoalsProps {
  user: UserProfile;
  onGainXp?: (amount: number) => void;
  activeNote?: Note;
}

interface StudyGoal {
  id: string;
  text: string;
  progress: number; // 0 to 100
  xpAwarded: boolean;
}

interface Suggestion {
  text: string;
  description: string;
}

const DEFAULT_GOALS: StudyGoal[] = [
  { id: "goal-1", text: "Analyze a research paper abstract", progress: 0, xpAwarded: false },
  { id: "goal-2", text: "Draft a high-fidelity concept map", progress: 0, xpAwarded: false },
  { id: "goal-3", text: "Refine a tech stack pitch script", progress: 0, xpAwarded: false },
];

export default function DailyStudyGoals({ user, onGainXp, activeNote }: DailyStudyGoalsProps) {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [rewardMsg, setRewardMsg] = useState("");

  // AI Auto-suggest States
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [singleSuggestingId, setSingleSuggestingId] = useState<string | null>(null);

  // Goal Reminder States
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTimer, setReminderTimer] = useState<number | null>(null); // in seconds
  const [reminderActive, setReminderActive] = useState(false);

  // Sound Utility: Synthesizes a beautiful physical E5 -> A5 chime with Web Audio API
  const playSubtleChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      
      playTone(659.25, now, 0.4); // E5
      playTone(880.00, now + 0.2, 0.6); // A5
    } catch (e) {
      console.warn("Web Audio chime failed", e);
    }
  };

  // Load goals and reminder configuration from LocalStorage or Fallbacks
  useEffect(() => {
    const cachedGoals = localStorage.getItem(`omnimind_goals_${user.email || "anon"}`);
    if (cachedGoals) {
      try {
        setGoals(JSON.parse(cachedGoals));
      } catch (e) {
        setGoals(DEFAULT_GOALS);
      }
    } else {
      setGoals(DEFAULT_GOALS);
    }

    const cachedReminders = localStorage.getItem(`omnimind_reminders_enabled_${user.email || "anon"}`);
    if (cachedReminders) {
      setRemindersEnabled(cachedReminders === "true");
    }
  }, [user.email]);

  // Goal Reminder Timer Engine (Countdown)
  useEffect(() => {
    if (!remindersEnabled || reminderTimer === null) {
      return;
    }

    const interval = setInterval(() => {
      setReminderTimer(prev => {
        if (prev === null || prev <= 1) {
          setReminderActive(true);
          playSubtleChime();
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [remindersEnabled, reminderTimer === null]);

  const saveGoals = (updatedGoals: StudyGoal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem(`omnimind_goals_${user.email || "anon"}`, JSON.stringify(updatedGoals));
  };

  const handleUpdateProgress = (id: string, newProgress: number) => {
    const boundedProgress = Math.max(0, Math.min(100, newProgress));
    
    const updated = goals.map(g => {
      if (g.id === id) {
        let xpTrigger = false;
        let alreadyAwarded = g.xpAwarded;

        if (boundedProgress === 100 && !alreadyAwarded) {
          xpTrigger = true;
          alreadyAwarded = true;
        }

        if (xpTrigger && onGainXp) {
          onGainXp(50);
          setRewardMsg(`Completed: "${g.text}"! +50 XP awarded!`);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3500);
        }

        return {
          ...g,
          progress: boundedProgress,
          xpAwarded: alreadyAwarded
        };
      }
      return g;
    });

    saveGoals(updated);
  };

  const handleStartEdit = (goal: StudyGoal) => {
    setEditingId(goal.id);
    setEditingText(goal.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    const updated = goals.map(g => {
      if (g.id === id) {
        return {
          ...g,
          text: editingText.trim(),
          progress: 0,
          xpAwarded: false
        };
      }
      return g;
    });
    saveGoals(updated);
    setEditingId(null);
  };

  const handleResetDaily = () => {
    const reset = goals.map(g => ({
      ...g,
      progress: 0,
      xpAwarded: false
    }));
    saveGoals(reset);
    setReminderActive(false);
  };

  // Gemini API: Fetch suggested study goals
  const handleFetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch("/api/suggest-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: user.level,
          recentNoteTitle: activeNote?.title,
          recentNoteContent: activeNote?.content
        })
      });
      const data = await response.json();
      if (data && data.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (e) {
      console.error("Failed to fetch suggested goals", e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Gemini API: Fetch a single targeted goal suggestion to auto-fill an input
  const handleFetchSingleSuggestion = async (goalId: string) => {
    setSingleSuggestingId(goalId);
    try {
      const response = await fetch("/api/suggest-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: user.level,
          recentNoteTitle: activeNote?.title,
          recentNoteContent: activeNote?.content
        })
      });
      const data = await response.json();
      if (data && data.suggestions && data.suggestions.length > 0) {
        // Pick one at random or index-based
        const picked = data.suggestions[Math.floor(Math.random() * data.suggestions.length)];
        setEditingText(picked.text);
      }
    } catch (e) {
      console.error("Failed to fetch single suggestion", e);
    } finally {
      setSingleSuggestingId(null);
    }
  };

  // Adopt suggestions logic
  const handleAdoptAllSuggestions = () => {
    if (suggestions.length < 3) return;
    const updated = goals.map((g, index) => ({
      ...g,
      text: suggestions[index]?.text || g.text,
      progress: 0,
      xpAwarded: false
    }));
    saveGoals(updated);
    setShowSuggestions(false);
  };

  const handleAdoptSingleSuggestion = (index: number, slotId: string) => {
    const chosen = suggestions[index];
    if (!chosen) return;
    const updated = goals.map(g => {
      if (g.id === slotId) {
        return {
          ...g,
          text: chosen.text,
          progress: 0,
          xpAwarded: false
        };
      }
      return g;
    });
    saveGoals(updated);
  };

  // Reminder toggle controls
  const handleToggleReminders = () => {
    const nextVal = !remindersEnabled;
    setRemindersEnabled(nextVal);
    localStorage.setItem(`omnimind_reminders_enabled_${user.email || "anon"}`, String(nextVal));
    if (!nextVal) {
      setReminderTimer(null);
      setReminderActive(false);
    } else {
      // Set a default demo snooze timer (e.g., 60 seconds) or alert instantly if tasks are outstanding
      setReminderTimer(120); // 2 minutes countdown
    }
  };

  const completedCount = goals.filter(g => g.progress === 100).length;
  const totalProgressPercentage = Math.round(
    goals.reduce((acc, curr) => acc + curr.progress, 0) / 3
  );
  const hasIncompleteGoals = goals.some(g => g.progress < 100);

  // Format countdown text
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="glass-card p-6 rounded-[24px] relative overflow-hidden flex flex-col gap-5 border border-white/10 transition-colors duration-300">
      
      {/* Celebration Toast overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-4 left-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-30 border border-purple-400/30"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-extrabold uppercase font-mono tracking-wider text-amber-300">XP Reward Dispatched!</p>
              <p className="text-xs font-bold truncate leading-snug">{rewardMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#d0bcff]" />
            <h3 className="text-base font-bold text-white">Daily Study Priorities</h3>
          </div>
          <p className="text-xs text-gray-400">Complete each customized priority to unlock +50 XP bonus multipliers!</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Gemini AI suggestion trigger */}
          <button
            onClick={handleFetchSuggestions}
            disabled={loadingSuggestions}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer border ${
              loadingSuggestions
                ? "bg-purple-900/10 border-purple-800/30 text-purple-400 animate-pulse"
                : "bg-purple-600/15 hover:bg-purple-600/25 border-purple-500/30 text-[#d0bcff]"
            }`}
            title="Auto-suggest tasks with Gemini"
          >
            <Brain className="w-3.5 h-3.5" />
            {loadingSuggestions ? "Generating..." : "AI Auto-Suggest"}
          </button>

          {/* Goals Reset */}
          <button 
            onClick={handleResetDaily}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer border border-white/5"
            title="Reset daily goals progress"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* activeNote grounding chip */}
      {activeNote && (
        <div className="flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/2 border border-white/5 text-[10px] text-gray-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse"></span>
          <span>Grounded on: <strong>{activeNote.title}</strong></span>
        </div>
      )}

      {/* Gemini Suggestions slide-out dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border border-[#d0bcff]/30 bg-purple-950/10 rounded-2xl p-4 flex flex-col gap-3 text-left relative"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase font-mono text-[#d0bcff] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Gemini Recommendations
              </span>
              <button 
                onClick={() => setShowSuggestions(false)}
                className="text-[10px] text-gray-400 hover:text-white cursor-pointer hover:underline"
              >
                Hide Suggestions
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {suggestions.map((s, idx) => (
                <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-2">
                  <div>
                    <p className="text-xs font-bold text-white leading-snug">{s.text}</p>
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">{s.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 self-start">
                    <span className="text-[9px] text-gray-500 font-mono uppercase">Apply to:</span>
                    <button 
                      onClick={() => handleAdoptSingleSuggestion(idx, "goal-1")}
                      className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] text-[#ffd9e4] font-mono cursor-pointer border border-white/5"
                    >
                      Priority 1
                    </button>
                    <button 
                      onClick={() => handleAdoptSingleSuggestion(idx, "goal-2")}
                      className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] text-[#d0bcff] font-mono cursor-pointer border border-white/5"
                    >
                      Priority 2
                    </button>
                    <button 
                      onClick={() => handleAdoptSingleSuggestion(idx, "goal-3")}
                      className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] text-[#4cd7f6] font-mono cursor-pointer border border-white/5"
                    >
                      Priority 3
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAdoptAllSuggestions}
              className="mt-1 w-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/30 text-white text-xs font-bold py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Adopt All 3 AI Suggestions
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Reminder Hub */}
      <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-white/2 border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {remindersEnabled ? (
              <Bell className="w-4 h-4 text-amber-400 animate-swing" />
            ) : (
              <BellOff className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-xs font-bold text-white">Study Goal Reminders</span>
          </div>
          <button
            onClick={handleToggleReminders}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider cursor-pointer border transition-all ${
              remindersEnabled
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {remindersEnabled ? "Active" : "Disabled"}
          </button>
        </div>

        {remindersEnabled && (
          <div className="flex flex-col gap-2.5 text-left border-t border-white/5 pt-2.5 mt-0.5">
            {/* Timer countdown controls */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {reminderTimer !== null 
                  ? `Goal reminder in: ${formatTime(reminderTimer)}` 
                  : "Reminder timer idle"}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setReminderTimer(60)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] text-gray-300 cursor-pointer transition-colors"
                >
                  1 Min Snooze
                </button>
                <button
                  onClick={() => setReminderTimer(1800)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] text-gray-300 cursor-pointer transition-colors"
                >
                  30 Min Snooze
                </button>
              </div>
            </div>

            {/* Glowing Amber Reminder Card */}
            {hasIncompleteGoals && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3 rounded-xl border flex gap-2.5 items-start ${
                  reminderActive
                    ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "bg-white/3 border-white/5"
                }`}
              >
                <AlertTriangle className={`w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 ${reminderActive ? "animate-bounce" : ""}`} />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-amber-400 block">Goal Reminder Active</span>
                  <span className="text-[10px] text-gray-400 block leading-snug">
                    You have <strong>{3 - completedCount} outstanding tasks</strong> for today! Finish them soon to safeguard your <strong>{user.streak} day streak</strong> and lock in your bonus multiplier!
                  </span>
                </div>
              </motion.div>
            )}

            {/* Quick chime player test */}
            <button
              onClick={playSubtleChime}
              className="flex items-center justify-center gap-1.5 py-1 text-[10px] text-gray-500 hover:text-white border border-dashed border-white/10 rounded-lg bg-black/15 transition-all"
            >
              <Volume2 className="w-3 h-3 text-purple-400" />
              <span>Preview Alarm Audio Tone</span>
            </button>
          </div>
        )}
      </div>

      {/* Mastery summary indicator */}
      <div className="p-3.5 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#ffd9e4]/10 border border-[#ffd9e4]/20 flex items-center justify-center">
            <Flame className="w-4.5 h-4.5 text-[#f751a1]" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-mono font-extrabold text-gray-400 uppercase tracking-wider block">Today's Progression</span>
            <span className="text-xs font-bold text-white">{completedCount} of 3 Milestones Cleared</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#ffd9e4] via-[#d0bcff] to-[#4cd7f6] transition-all duration-500"
              style={{ width: `${totalProgressPercentage}%` }}
            />
          </div>
          <span className="text-[11px] font-mono font-bold text-[#4cd7f6]">{totalProgressPercentage}%</span>
        </div>
      </div>

      {/* Three customizable priority cards */}
      <div className="space-y-3">
        {goals.map((g) => {
          const isCompleted = g.progress === 100;
          const isEditing = editingId === g.id;

          return (
            <div 
              key={g.id}
              className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col gap-2.5 ${
                isCompleted 
                  ? "bg-green-500/5 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]" 
                  : "bg-white/3 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 text-left">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative flex items-center">
                        <input
                          type="text"
                          id={`goal-input-${g.id}`}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full bg-black/40 border border-[#d0bcff]/40 rounded-lg pl-2.5 pr-8 py-1 text-xs text-white focus:outline-none focus:ring-0 font-sans"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(g.id)}
                        />
                        
                        {/* Auto-suggest inside input field */}
                        <button
                          onClick={() => handleFetchSingleSuggestion(g.id)}
                          disabled={singleSuggestingId !== null}
                          className="absolute right-2 text-gray-500 hover:text-[#d0bcff] transition-all cursor-pointer"
                          title="Auto-suggest single study task"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${singleSuggestingId === g.id ? "animate-spin text-purple-400" : ""}`} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleSaveEdit(g.id)}
                        className="p-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/title">
                      <span className={`text-xs font-bold truncate leading-normal ${isCompleted ? "text-green-400 line-through opacity-70" : "text-white"}`}>
                        {g.text}
                      </span>
                      <button 
                        onClick={() => handleStartEdit(g)}
                        className="opacity-0 group-hover/title:opacity-100 p-0.5 rounded text-gray-500 hover:text-white transition-all cursor-pointer"
                        title="Edit goal title"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isCompleted ? (
                    <span className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-2.5 h-2.5" /> +50 XP
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-gray-500 font-bold">{g.progress}%</span>
                  )}
                </div>
              </div>

              {/* Progress Slider bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative h-3 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="25"
                    value={g.progress}
                    onChange={(e) => handleUpdateProgress(g.id, parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-white/10 outline-none cursor-pointer accent-[#d0bcff]"
                    style={{
                      background: `linear-gradient(to right, #d0bcff 0%, #4cd7f6 ${g.progress}%, rgba(255,255,255,0.1) ${g.progress}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                </div>

                {/* Direct complete toggle check */}
                <button
                  onClick={() => handleUpdateProgress(g.id, isCompleted ? 0 : 100)}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    isCompleted 
                      ? "bg-green-500/20 border-green-500/30 text-green-400" 
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                  title={isCompleted ? "Mark incomplete" : "Quick complete goal"}
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
