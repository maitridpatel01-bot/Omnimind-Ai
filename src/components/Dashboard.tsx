/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FileText, ChevronRight, AlertCircle, Sparkles, Award, Lock, Unlock, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, ChatSession, Note } from "../types";
import DailyStudyGoals from "./DailyStudyGoals";

interface DashboardProps {
  user: UserProfile;
  sessions: ChatSession[];
  onSelectTab: (tab: string) => void;
  onSelectChat: (chatId: string) => void;
  onGainXp?: (amount: number) => void;
  activeNote?: Note;
}

export default function Dashboard({ user, sessions, onSelectTab, onSelectChat, onGainXp, activeNote }: DashboardProps) {
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSummarizeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setLoading(true);
    setError("");
    setSummaryResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: `Please summarize the following document or paper text into a title and 3 precise bullet points. Make it clear and highly informative.\n\nText:\n${promptInput}`,
          systemPrompt: "You are an expert academic paper summarizer. Summarize concisely."
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummaryResult(data.content || "Could not generate summary.");
      if (onGainXp) {
        onGainXp(60);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  }

  const xpPercent = (user.xp || 250) / (user.xpMax || 1000);
  const strokeDashoffset = 175.9 * (1 - xpPercent);
  const xpPercentString = `${Math.round(xpPercent * 100)}%`;

  // Dynamic Badge Unlocking Engine
  const getBadges = () => {
    const hasNovice = true;
    const hasSynthesizer = activeNote && activeNote.content && activeNote.content.length > 150;
    const hasExported = localStorage.getItem("omnimind_badge_exported") === "true";
    
    let hasQuestCompleter = false;
    try {
      const cachedGoals = localStorage.getItem(`omnimind_goals_${user.email || "anon"}`);
      if (cachedGoals) {
        const parsed = JSON.parse(cachedGoals);
        hasQuestCompleter = parsed.some((g: any) => g.progress === 100);
      }
    } catch (e) {
      // Ignore fallback
    }

    const hasPathfinder = localStorage.getItem("omnimind_badge_mapped") === "true";
    const hasExplorer = sessions && sessions.length > 0;

    return [
      {
        id: "novice",
        title: "Novice Scholar",
        description: "Welcome to OmniMind Workspace.",
        unlocked: hasNovice,
        icon: "school",
        themeColor: "from-purple-500/10 to-indigo-500/10 border-indigo-500/25 text-indigo-300",
        badgeGlow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]"
      },
      {
        id: "synth",
        title: "Deep Synthesizer",
        description: "Draft an analytical note of over 150 characters.",
        unlocked: !!hasSynthesizer,
        icon: "psychology",
        themeColor: "from-pink-500/10 to-rose-500/10 border-rose-500/25 text-pink-300",
        badgeGlow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]"
      },
      {
        id: "exporter",
        title: "Master Exporter",
        description: "Export note as a formatted Markdown or PDF.",
        unlocked: hasExported,
        icon: "cloud_download",
        themeColor: "from-emerald-500/10 to-teal-500/10 border-teal-500/25 text-emerald-300",
        badgeGlow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]"
      },
      {
        id: "quest",
        title: "Quest Completer",
        description: "Achieve 100% on a Daily Study Priority.",
        unlocked: hasQuestCompleter,
        icon: "task_alt",
        themeColor: "from-amber-500/10 to-orange-500/10 border-orange-500/25 text-amber-300",
        badgeGlow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]"
      },
      {
        id: "pathfinder",
        title: "Map Pathfinder",
        description: "Interact with or expand a custom Knowledge Map.",
        unlocked: hasPathfinder,
        icon: "hub",
        themeColor: "from-cyan-500/10 to-sky-500/10 border-sky-500/25 text-cyan-300",
        badgeGlow: "shadow-[0_0_15px_rgba(6,182,212,0.3)]"
      },
      {
        id: "explorer",
        title: "AI Co-Pilot",
        description: "Initiate an expert consulting session in Chat.",
        unlocked: hasExplorer,
        icon: "smart_toy",
        themeColor: "from-blue-500/10 to-cyan-500/10 border-blue-500/25 text-blue-300",
        badgeGlow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]"
      }
    ];
  };

  const badges = getBadges();
  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="flex flex-col gap-8">
      {/* AI Greeting */}
      <section className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Good morning, {user.name || "Alex"}.</h1>
        <p className="text-gray-400 text-sm">Ready to innovate?</p>
      </section>

      {/* Quick Actions (Bento Pattern) */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onSelectTab("chat")}
          className="col-span-2 glass-card p-5 rounded-[24px] flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(208,188,255,0.3)]">
              <span className="material-symbols-outlined font-semibold text-2xl">chat_bubble</span>
            </div>
            <div>
              <span className="font-semibold block text-white text-base">Start New Chat</span>
              <span className="text-xs text-gray-400">Powered by Omni-4.0</span>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-[#d0bcff] transition-colors" />
        </button>

        <button 
          onClick={() => onSelectTab("research")}
          className="glass-card p-5 rounded-[24px] flex flex-col items-start gap-4 active:scale-[0.98] transition-all text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#4cd7f6] text-3xl">upload_file</span>
          <span className="text-sm font-semibold text-white">Upload File</span>
        </button>

        <button 
          onClick={() => setShowSummaryModal(true)}
          className="glass-card p-5 rounded-[24px] flex flex-col items-start gap-4 active:scale-[0.98] transition-all text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#f751a1] text-3xl">summarize</span>
          <span className="text-sm font-semibold text-white">Summarize Paper</span>
        </button>
      </section>

      {/* Daily Study Priorities Goal System */}
      <section>
        <DailyStudyGoals user={user} onGainXp={onGainXp} activeNote={activeNote} />
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-[24px] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider block">Current Level</span>
            <h3 className="text-xl font-bold text-white">Level {user.level || 1}</h3>
            <p className="text-xs text-[#d0bcff] font-semibold">{user.xp || 250} / {user.xpMax || 1000} XP</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-white/5" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="5"></circle>
              <circle className="text-[#d0bcff]" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="5"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-mono font-bold text-white">{xpPercentString}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[24px] overflow-hidden relative">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider block">Study Streak</span>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-white">{user.streak || 1}</h3>
                <span className="text-sm text-gray-400 font-medium">Days</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#f751a1]/10 flex items-center justify-center border border-[#f751a1]/20">
              <Sparkles className="w-6 h-6 text-[#f751a1]" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer opacity-10 pointer-events-none"></div>
        </div>
      </section>

      {/* Dynamic Achievement Badges Panel */}
      <section id="achievement-badges-section" className="space-y-4">
        <div className="flex justify-between items-baseline">
          <h2 id="achievements-section-title" className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#d0bcff]" />
            Knowledge Achievements
          </h2>
          <span id="achievements-badge-count" className="text-xs font-mono font-bold text-[#4cd7f6] uppercase tracking-wider bg-[#4cd7f6]/10 px-2.5 py-0.5 rounded-full border border-[#4cd7f6]/20">
            {unlockedCount} / {badges.length} Earned
          </span>
        </div>

        <div id="achievements-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              id={`badge-card-${badge.id}`}
              className={`glass-card p-4 rounded-[20px] border flex flex-col justify-between transition-all relative group overflow-hidden ${
                badge.unlocked 
                  ? `bg-gradient-to-br ${badge.themeColor} ${badge.badgeGlow} hover:scale-[1.02]` 
                  : "bg-white/[0.01] border-white/5 opacity-50"
              }`}
            >
              {/* Subtle light streak background for unlocked badges */}
              {badge.unlocked && (
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none"></div>
              )}

              <div className="flex justify-between items-start">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  badge.unlocked ? "bg-white/10" : "bg-white/5"
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {badge.icon}
                  </span>
                </div>
                <div>
                  {badge.unlocked ? (
                    <div id={`badge-status-unlocked-${badge.id}`} className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Unlocked!">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : (
                    <div id={`badge-status-locked-${badge.id}`} className="p-1 rounded-full bg-white/5 text-gray-500" title="Locked">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <h4 id={`badge-title-${badge.id}`} className="text-xs font-bold text-white tracking-wide">
                  {badge.title}
                </h4>
                <p id={`badge-desc-${badge.id}`} className="text-[10px] text-gray-400 leading-tight">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Chats */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Recent Chats</h2>
          <button onClick={() => onSelectTab("chat")} className="text-xs text-[#d0bcff] font-bold hover:underline cursor-pointer">View All</button>
        </div>
        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.slice(0, 2).map((s) => (
              <div 
                key={s.id}
                onClick={() => onSelectChat(s.id)}
                className="glass-card p-4 rounded-[20px] flex items-center gap-4 active:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-gray-400">terminal</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate text-sm">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.timestamp}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))
          ) : (
            <div className="glass-card p-5 text-center text-sm text-gray-500 rounded-[20px]">
              No active conversations yet.
            </div>
          )}
        </div>
      </section>

      {/* Learning Paths */}
      <section className="space-y-4 pb-12">
        <h2 className="text-lg font-bold text-white">For You</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x no-scrollbar">
          <div className="glass-card p-5 rounded-[24px] min-w-[280px] snap-start relative overflow-hidden flex flex-col gap-4 border border-white/5">
            <div className="h-32 rounded-xl bg-indigo-950/20 border border-white/10 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/10 to-transparent">
              <span className="font-mono text-xs text-[#d0bcff] tracking-wider font-bold">NEURAL_NET_V4</span>
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#d0bcff]/10 text-[#d0bcff] text-[10px] font-bold font-mono tracking-wide uppercase mb-2">Intermediate</span>
              <h4 className="font-bold text-white text-base">Advanced Neural Networks</h4>
              <p className="text-xs text-gray-400 mt-1">4.5 hours • 12 modules</p>
            </div>
            <button 
              onClick={() => onSelectTab("chat")}
              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-xs text-white border border-white/10 transition-colors cursor-pointer"
            >
              Start Learning
            </button>
          </div>

          <div className="glass-card p-5 rounded-[24px] min-w-[280px] snap-start relative overflow-hidden flex flex-col gap-4 border border-white/5">
            <div className="h-32 rounded-xl bg-cyan-950/20 border border-white/10 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/40 via-slate-900/10 to-transparent">
              <span className="font-mono text-xs text-[#4cd7f6] tracking-wider font-bold">INTERFACE_SPEC_V2</span>
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] text-[10px] font-bold font-mono tracking-wide uppercase mb-2">Beginner</span>
              <h4 className="font-bold text-white text-base">AI Design Systems</h4>
              <p className="text-xs text-gray-400 mt-1">2 hours • 8 modules</p>
            </div>
            <button 
              onClick={() => onSelectTab("chat")}
              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-xs text-white border border-white/10 transition-colors cursor-pointer"
            >
              Start Learning
            </button>
          </div>
        </div>
      </section>

      {/* Summarize Paper Modal */}
      <AnimatePresence>
        {showSummaryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg glass-card rounded-[24px] border border-white/10 overflow-hidden shadow-2xl bg-[#0a0a0f]/95 backdrop-blur-3xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-lg text-white font-bold flex items-center gap-2">
                  <FileText className="text-[#f751a1] w-5 h-5" />
                  Summarize Paper
                </h3>
                <button 
                  onClick={() => {
                    setShowSummaryModal(false);
                    setPromptInput("");
                    setSummaryResult("");
                  }}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <form onSubmit={handleSummarizeSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Paste Paper/Abstract Text</label>
                    <textarea 
                      rows={5}
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="Paste research contents here..."
                      className="w-full bg-black/40 border border-white/10 focus:border-[#d0bcff]/50 rounded-2xl p-4 text-sm focus:outline-none focus:ring-0 text-white placeholder-gray-600 font-sans"
                    />
                  </div>
                  {error && (
                    <div className="text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold rounded-xl active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? "Analyzing with Gemini..." : "Generate AI Summary"}
                  </button>
                </form>

                {summaryResult && (
                  <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 max-h-48 overflow-y-auto font-sans text-sm leading-relaxed text-gray-300">
                    <p className="font-bold text-white mb-2">AI Summary Result:</p>
                    <div className="whitespace-pre-wrap font-sans">{summaryResult}</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
