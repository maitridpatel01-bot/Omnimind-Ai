/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Play, RotateCcw, AlertTriangle, Cpu, CheckCircle2, ChevronRight, HelpCircle, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CodeWorkspaceProps {
  onGainXp?: (amount: number) => void;
}

export default function CodeWorkspace({ onGainXp }: CodeWorkspaceProps) {
  const [code, setCode] = useState(`import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, "SECRET_KEY")
    return encoded_jwt`);

  const [mentorQuery, setMentorQuery] = useState("");
  const [mentorResponse, setMentorResponse] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [runExecuted, setRunExecuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'stats'>('console');

  const executeCodeAssistant = async (action: 'optimize' | 'explain' | 'debug' | 'refactor' | 'explainLine8') => {
    setMentorLoading(true);
    setMentorResponse("");
    let promptAction = action;
    let customCode = code;

    if (action === 'refactor') {
      promptAction = 'optimize';
      customCode = `${code}\n# Refactor line 8 to use an environment variable with python-dotenv.`;
    } else if (action === 'explainLine8') {
      promptAction = 'explain';
      customCode = `encoded_jwt = jwt.encode(to_encode, "SECRET_KEY")\n# Explain the security implications of this specific hardcoded line.`;
    }

    try {
      const res = await fetch("/api/code-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: customCode, action: promptAction })
      });
      const data = await res.json();
      if (res.ok) {
        setMentorResponse(data.response || "No feedback generated.");
        if (onGainXp) {
          onGainXp(30);
        }
      } else {
        throw new Error(data.error || "Failed to communicate with mentor.");
      }
    } catch (err: any) {
      setMentorResponse(`Error contacting AI Mentor: ${err.message}. Please configure your GEMINI_API_KEY.`);
    } finally {
      setMentorLoading(false);
    }
  };

  const handleRunCode = () => {
    setRunLoading(true);
    setRunExecuted(false);
    setTimeout(() => {
      setRunLoading(false);
      setRunExecuted(true);
      if (onGainXp) {
        onGainXp(25);
      }
    }, 1200);
  };

  const handleAskMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorQuery.trim()) return;
    setMentorLoading(true);
    setMentorResponse("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Explain this question about the code:\nPrompt: ${mentorQuery}\n\nCode:\n${code}`,
          systemPrompt: "You are an expert AI software engineering mentor. Provide very clear, direct, and structurally optimized feedback."
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMentorResponse(data.content || "No advice generated.");
        if (onGainXp) {
          onGainXp(35);
        }
      } else {
        throw new Error(data.error || "Error query.");
      }
    } catch (err: any) {
      setMentorResponse(`Error: ${err.message}`);
    } finally {
      setMentorLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Code Workspace Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Code Workspace</h2>
          <p className="text-gray-400 text-xs mt-1">Refining <span className="text-[#4cd7f6] font-mono">auth_service.py</span> • 1 active warning</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={() => {
              setCode(`import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, "SECRET_KEY")
    return encoded_jwt`);
              setRunExecuted(false);
            }}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button 
            onClick={handleRunCode}
            disabled={runLoading}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-lg shadow-[#d0bcff]/15"
          >
            <Play className="w-3.5 h-3.5" />
            {runLoading ? "Running tests..." : "Run Code"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-[24px] overflow-hidden shadow-2xl relative border border-white/5 bg-black/20">
            {/* Editor Top Bar */}
            <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                </div>
                <span className="text-xs font-mono text-gray-400">src/auth_service.py</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#d0bcff] font-mono">Python 3.10</span>
                <span className="material-symbols-outlined text-gray-500 text-sm">settings</span>
              </div>
            </div>

            {/* Code Textarea editor */}
            <div className="flex relative bg-black/30 p-4 min-h-[220px]">
              <div className="text-right text-gray-600 font-mono text-xs select-none pr-4 border-r border-white/5 leading-6 text-[11px]">
                01<br/>02<br/>03<br/>04<br/>05<br/>06<br/>07<br/>08<br/>09<br/>10
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-mono focus:outline-none text-gray-300 leading-6 pl-4 resize-none focus:ring-transparent h-56"
              />
            </div>

            {/* Warn Overlay Banner (Ref image line 8 warning) */}
            {code.includes('"SECRET_KEY"') && (
              <div className="px-6 py-2.5 bg-red-500/10 border-t border-b border-red-500/20 text-red-400 font-sans text-[10px] flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Warning: Insecure hardcoded secret key on line 08</span>
              </div>
            )}

            {/* Quick action bar */}
            <div className="bg-white/5 px-4 py-3 border-t border-white/10 flex flex-wrap gap-2">
              <button 
                onClick={() => executeCodeAssistant('optimize')}
                className="px-3 py-1.5 rounded-lg bg-[#d0bcff]/10 border border-[#d0bcff]/20 text-[#d0bcff] text-[10px] font-bold font-mono tracking-wide uppercase flex items-center gap-1.5 hover:bg-[#d0bcff]/20 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Optimize
              </button>
              <button 
                onClick={() => executeCodeAssistant('debug')}
                className="px-3 py-1.5 rounded-lg bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 text-[#4cd7f6] text-[10px] font-bold font-mono tracking-wide uppercase flex items-center gap-1.5 hover:bg-[#4cd7f6]/20 transition-colors cursor-pointer"
              >
                <Cpu className="w-3 h-3" />
                Debug
              </button>
              <button 
                onClick={() => executeCodeAssistant('explain')}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold font-mono tracking-wide uppercase flex items-center gap-1.5 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                Explain Code
              </button>
            </div>
          </div>

          {/* Execution Output (Judge0) Panel */}
          <div className="glass-card rounded-[24px] p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                <Cpu className="text-[#4cd7f6] w-4 h-4" />
                Execution Results
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-mono border border-emerald-500/20 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  Judge0 Ready
                </span>
              </div>
            </div>

            {runExecuted ? (
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">Status</p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/30 uppercase tracking-wider">Accepted</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[9px] font-mono text-gray-500 mb-0.5">Time</p>
                      <p className="font-mono text-xs font-semibold text-white">42ms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-mono text-gray-500 mb-0.5">Memory</p>
                      <p className="font-mono text-xs font-semibold text-white">12.4 MB</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-mono text-gray-500 mb-0.5">Pass Rate</p>
                      <p className="font-mono text-xs font-semibold text-white">100%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-4 font-mono text-xs text-gray-400 border border-white/5 space-y-1">
                  <p className="text-gray-500">$ python auth_service.py --test</p>
                  <p className="text-emerald-400">✓ Test Case 1: valid_token_creation (passed)</p>
                  <p className="text-emerald-400">✓ Test Case 2: expiration_check (passed)</p>
                  <p className="text-yellow-400">! Warning: Runtime exceeds p90 average by 5ms</p>
                </div>
              </div>
            ) : runLoading ? (
              <div className="text-center py-8 bg-black/20 rounded-2xl text-xs text-gray-500 font-mono animate-pulse">
                Running tests through sandboxed environment...
              </div>
            ) : (
              <div className="text-center py-8 bg-black/10 border border-dashed border-white/5 rounded-2xl text-xs text-gray-500 font-mono">
                Click "Run Code" above to trigger test validation suite.
              </div>
            )}
          </div>
        </div>

        {/* AI Mentor & Leetcode Column */}
        <div className="space-y-6">
          {/* AI Mentor Panel */}
          <div className="glass-card rounded-[24px] p-6 border border-[#d0bcff]/20 bg-[#d0bcff]/5 relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d0bcff]/20 flex items-center justify-center border border-[#d0bcff]/30">
                  <span className="material-symbols-outlined text-[#d0bcff] text-xl">psychology</span>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-white text-sm">AI Mentor</h3>
                  <p className="text-[10px] text-[#d0bcff]/80 font-mono font-bold tracking-widest uppercase">OMNIMIND-4.0 ACTIVE</p>
                </div>
              </div>

              <div className="bg-[#131313]/60 border border-white/10 rounded-2xl p-4">
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  "The security risk on line 08 is critical. Consider using an environment variable or secret manager. Would you like me to refactor this using <span className="text-[#d0bcff] font-semibold">python-dotenv</span>?"
                </p>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <button 
                  onClick={() => executeCodeAssistant('refactor')}
                  className="w-full text-left p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all flex justify-between items-center group cursor-pointer"
                >
                  <span className="text-xs text-gray-200">Refactor for security</span>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#d0bcff]" />
                </button>
                <button 
                  onClick={() => executeCodeAssistant('explainLine8')}
                  className="w-full text-left p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all flex justify-between items-center group cursor-pointer"
                >
                  <span className="text-xs text-gray-200">Explain line 08</span>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#d0bcff]" />
                </button>
              </div>

              {/* Interactive Mentor reply container */}
              <AnimatePresence>
                {mentorResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="p-4 rounded-xl bg-black/40 border border-white/5 max-h-40 overflow-y-auto text-xs leading-relaxed text-gray-300 whitespace-pre-wrap font-mono"
                  >
                    {mentorResponse}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat with mentor prompt */}
              <form onSubmit={handleAskMentor} className="flex gap-2">
                <input 
                  type="text" 
                  value={mentorQuery}
                  onChange={(e) => setMentorQuery(e.target.value)}
                  placeholder={mentorLoading ? "Consulting..." : "Ask mentor..."}
                  disabled={mentorLoading}
                  className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#d0bcff]/50 transition-all text-white placeholder-gray-600 font-sans"
                />
                <button 
                  type="submit"
                  disabled={mentorLoading}
                  className="w-9 h-9 shrink-0 rounded-xl bg-[#d0bcff] flex items-center justify-center text-slate-950 hover:bg-[#c3aaff] transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* LeetCode Prep */}
          <div className="glass-card rounded-[24px] p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-white text-sm">LeetCode Prep</h3>
              <span className="text-[10px] font-mono text-gray-500">Level 1</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] text-[#f751a1] uppercase font-bold font-mono tracking-wider mb-0.5">Daily Challenge</p>
                  <h4 className="font-bold text-white text-sm font-sans">2Sum in Sorted Array</h4>
                </div>
                <span className="text-[10px] font-mono text-gray-500">#167</span>
              </div>
              <div className="flex gap-3 text-[10px] font-semibold">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Easy</span>
                <span className="text-gray-400">15 min</span>
              </div>
              <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                <div className="absolute left-0 top-0 h-full bg-[#d0bcff] rounded-full" style={{ width: "65%" }}></div>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-gray-500">
                <span>65% Completion</span>
                <span>+25 XP</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-gray-500 font-mono font-bold uppercase">Streak</p>
                <p className="text-xl font-bold text-[#4cd7f6] mt-0.5 font-sans">1</p>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-gray-500 font-mono font-bold uppercase">Solved</p>
                <p className="text-xl font-bold text-[#f751a1] mt-0.5 font-sans">284</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
