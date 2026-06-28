/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Terminal, FileText, ChevronRight, AlertCircle, TrendingUp, Compass, Award, Plus, PlusCircle, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ATSReview } from "../types";

interface StartupStudioProps {
  onGainXp?: (amount: number) => void;
}

export default function StartupStudio({ onGainXp }: StartupStudioProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [companyName, setCompanyName] = useState("Vapor AI");
  const [coreFocus, setCoreFocus] = useState("Edge Inference Silicon");
  const [sprintStatus, setSprintStatus] = useState("Reviewing low-latency TSMC compile metrics, optimizing pipeline routes.");
  const [reportResult, setReportResult] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // Resume ATS states
  const [showATSModal, setShowATSModal] = useState(false);
  const [resumeText, setResumeText] = useState("Alex Rivera\nSoftware Engineer Lead with 6 years experience specializing in cloud architecture, Python backend pipelines, and low-latency deployments. Experienced with Docker, Kubernetes, AWS, and modern CI/CD automation.");
  const [jobDesc, setJobDesc] = useState("Lead Systems Architect with deep expertise in edge-inference delivery, Python pipelines, Kubernetes orchestration, and TLS encryption. Requires strong focus on metrics and performance tuning.");
  const [atsResult, setAtsResult] = useState<ATSReview | null>({
    score: 94,
    status: "Optimal",
    feedback: "High alignment with Python backend engineering, cloud automation, and scalable deployments.",
    improvements: ["Add more quantitative metrics to your Engineering Lead role.", "Specify TLS encryption and high-contrast API security experience."]
  });
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsError, setAtsError] = useState("");

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportLoading(true);
    setReportResult("");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, coreFocus, sprintStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setReportResult(data.report || "No report generated.");
        if (onGainXp) {
          onGainXp(45);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setReportResult(`Error contact: ${err.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  const handleRunATSReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setAtsLoading(true);
    setAtsError("");
    setAtsResult(null);
    try {
      const res = await fetch("/api/ats-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jobDesc })
      });
      const data = await res.json();
      if (res.ok) {
        setAtsResult(data);
        if (onGainXp) {
          onGainXp(40);
        }
      } else {
        throw new Error(data.error || "Failed to parse ATS result.");
      }
    } catch (err: any) {
      setAtsError(err.message || "Failed to analyze resume.");
    } finally {
      setAtsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-3xl mx-auto">
      {/* Startup Studio Header */}
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Startup Studio</h2>
          <p className="text-gray-500 font-mono text-[10px] uppercase font-bold tracking-widest mt-1">ACTIVE SPRINT</p>
        </div>
        <span className="flex h-2.5 w-2.5 rounded-full bg-[#4cd7f6] animate-pulse"></span>
      </section>

      {/* Agents lists */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* CEO Agent */}
          <div className="glass-card p-5 rounded-[24px] flex items-center gap-4 relative overflow-hidden border border-[#d0bcff]/20 bg-[#d0bcff]/5">
            <div className="w-14 h-14 rounded-2xl bg-[#d0bcff]/10 flex items-center justify-center border border-[#d0bcff]/20 shrink-0">
              <span className="material-symbols-outlined text-[#d0bcff] text-3xl">psychology</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Lead Strategist</p>
              <h3 className="font-bold text-white text-base font-sans">Aria-1 CEO</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">Optimizing Series A pitch deck structure...</p>
            </div>
            <div className="absolute top-3 right-3 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4cd7f6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4cd7f6]"></span>
            </div>
          </div>

          {/* CTO Agent */}
          <div className="glass-card p-5 rounded-[24px] flex items-center gap-4 border border-white/5 bg-white/[0.01]">
            <div className="w-14 h-14 rounded-2xl bg-[#4cd7f6]/10 flex items-center justify-center border border-[#4cd7f6]/20 shrink-0">
              <span className="material-symbols-outlined text-[#4cd7f6] text-3xl">terminal</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Tech Infrastructure</p>
              <h3 className="font-bold text-white text-base font-sans">Nexus-4 CTO</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">Kubernetes cluster latency reduced by 14%.</p>
            </div>
          </div>

          {/* Board report generator block */}
          <button 
            onClick={() => setShowReportModal(true)}
            className="w-full glass-card p-6 rounded-[24px] flex flex-col items-center justify-center gap-3 border-dashed border border-white/10 hover:border-[#d0bcff]/40 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-4xl text-gray-500 group-hover:text-primary">summarize</span>
            <span className="text-xs font-semibold text-gray-300">Generate Monthly Board Report</span>
          </button>
        </div>
      </section>

      {/* Career Center Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white font-sans">Career Center</h2>
        <div 
          onClick={() => setShowATSModal(true)}
          className="glass-card rounded-[24px] overflow-hidden border border-white/10 cursor-pointer hover:border-[#4cd7f6]/30 transition-all shadow-2xl"
        >
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Resume Visual Preview</span>
            <span className="material-symbols-outlined text-[#4cd7f6] text-sm">visibility</span>
          </div>
          <div className="p-6 flex gap-4 items-center">
            {/* Resume Page Mockup */}
            <div className="w-24 h-32 bg-white/[0.02] rounded-xl border border-white/10 p-3 flex flex-col gap-2 shrink-0">
              <div className="h-1.5 w-1/2 bg-[#d0bcff]/40 rounded"></div>
              <div className="h-1 w-full bg-gray-600/30 rounded"></div>
              <div className="h-1 w-full bg-gray-600/30 rounded"></div>
              <div className="h-1 w-3/4 bg-gray-600/30 rounded"></div>
              <div className="h-3 w-1/3 bg-[#4cd7f6]/20 rounded mt-1"></div>
              <div className="h-1 w-full bg-gray-600/30 rounded"></div>
            </div>

            {/* ATS Scoring */}
            {atsResult && (
              <div className="flex-grow space-y-2">
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">ATS Compatibility</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#4cd7f6]">{atsResult.score}%</span>
                  <span className="text-xs font-bold text-emerald-400">{atsResult.status}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#4cd7f6] h-full rounded-full" style={{ width: `${atsResult.score}%` }}></div>
                </div>
                <p className="text-[11px] text-gray-400 italic font-medium leading-tight">
                  "{atsResult.improvements[0]}"
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white font-sans">Performance</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Learning velocity chart */}
          <div className="glass-card p-5 rounded-[24px] col-span-2 space-y-4 border border-white/5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">Learning Velocity</h4>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d0bcff]"></span>
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
              </div>
            </div>
            <div className="h-32 w-full flex items-end justify-between gap-3 px-2 pb-2">
              <div className="w-full bg-[#d0bcff]/20 rounded-t h-[40%] hover:bg-[#d0bcff]/40 transition-colors"></div>
              <div className="w-full bg-[#d0bcff]/20 rounded-t h-[65%] hover:bg-[#d0bcff]/40 transition-colors"></div>
              <div className="w-full bg-[#d0bcff]/30 rounded-t h-[30%] hover:bg-[#d0bcff]/40 transition-colors"></div>
              <div className="w-full bg-[#d0bcff]/50 rounded-t h-[85%] hover:bg-[#d0bcff]/40 transition-colors"></div>
              <div className="w-full bg-[#d0bcff]/20 rounded-t h-[50%] hover:bg-[#d0bcff]/40 transition-colors"></div>
              <div className="w-full bg-[#4cd7f6] rounded-t h-[95%] shadow-[0_-5px_15px_rgba(76,215,246,0.3)]"></div>
              <div className="w-full bg-[#d0bcff]/20 rounded-t h-[45%] hover:bg-[#d0bcff]/40 transition-colors"></div>
            </div>
          </div>

          {/* Skill mesh placeholder */}
          <div className="glass-card p-5 rounded-[24px] flex flex-col items-center justify-center relative overflow-hidden h-36 border border-white/5">
            <div className="absolute inset-0 opacity-15 flex items-center justify-center">
              <div className="w-20 h-20 border border-gray-400 rounded-full animate-pulse"></div>
              <div className="absolute w-12 h-12 border border-gray-400 rounded-full"></div>
            </div>
            <span className="material-symbols-outlined text-[#d0bcff] text-3xl">radar</span>
            <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mt-2">Skill Mesh</p>
          </div>

          {/* Streak details card */}
          <div className="glass-card p-5 rounded-[24px] flex flex-col justify-between h-36 border-l-4 border-[#4cd7f6] bg-[#4cd7f6]/5">
            <div>
              <p className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">Active Streak</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">1</h3>
            </div>
            <div className="flex gap-1">
              <div className="w-full h-1 bg-[#4cd7f6] rounded"></div>
              <div className="w-full h-1 bg-[#4cd7f6] rounded"></div>
              <div className="w-full h-1 bg-[#4cd7f6] rounded"></div>
              <div className="w-full h-1 bg-[#4cd7f6] rounded"></div>
              <div className="w-full h-1 bg-white/10 rounded"></div>
            </div>
            <p className="text-[9px] font-mono font-semibold text-gray-500">3 days to Diamond tier</p>
          </div>
        </div>
      </section>

      {/* Board Report Generator Modal */}
      <AnimatePresence>
        {showReportModal && (
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
              className="w-full max-w-lg glass-card rounded-[24px] border border-white/10 overflow-hidden shadow-2xl bg-[#1c1b1b]"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-lg text-white font-bold flex items-center gap-2">
                  <Compass className="text-[#d0bcff] w-5 h-5" />
                  Startup Board Report
                </h3>
                <button 
                  onClick={() => {
                    setShowReportModal(false);
                    setReportResult("");
                  }}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleGenerateReport} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Company Name</label>
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-[#d0bcff]/50 rounded-xl px-4 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Core Tech Focus</label>
                      <input 
                        type="text" 
                        value={coreFocus}
                        onChange={(e) => setCoreFocus(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-[#d0bcff]/50 rounded-xl px-4 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Sprint Accomplishments</label>
                    <textarea 
                      rows={3}
                      value={sprintStatus}
                      onChange={(e) => setSprintStatus(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-[#d0bcff]/50 rounded-xl p-3 text-xs text-white"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={reportLoading}
                    className="w-full py-3 bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    {reportLoading ? "Synthesizing Venture Report..." : "Draft Board Report"}
                  </button>
                </form>

                {reportResult && (
                  <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 max-h-48 overflow-y-auto text-xs leading-relaxed text-gray-300 font-mono whitespace-pre-wrap">
                    <p className="font-bold text-white mb-2 font-sans text-sm">Drafted Report:</p>
                    {reportResult}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume ATS Compatibility Modal */}
      <AnimatePresence>
        {showATSModal && (
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
              className="w-full max-w-lg glass-card rounded-[24px] border border-white/10 overflow-hidden shadow-2xl bg-[#1c1b1b]"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-lg text-white font-bold flex items-center gap-2">
                  <Award className="text-[#4cd7f6] w-5 h-5" />
                  ATS Resume Scanner
                </h3>
                 <button 
                  onClick={() => {
                    setShowATSModal(false);
                    setAtsError("");
                  }}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleRunATSReview} className="space-y-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Paste Resume Text</label>
                    <textarea 
                      rows={4}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-[#d0bcff]/50 rounded-xl p-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Target Job Description</label>
                    <textarea 
                      rows={4}
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-[#d0bcff]/50 rounded-xl p-3 text-xs text-white"
                    />
                  </div>
                  {atsError && (
                    <div className="text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {atsError}
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={atsLoading}
                    className="w-full py-3 bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    {atsLoading ? "Running Recruiter Audit..." : "Analyze Match Compatibility"}
                  </button>
                </form>

                {atsResult && (
                  <div className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-sans text-xs">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-white text-sm">Audit Findings:</p>
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/30 uppercase tracking-wider">
                        Score: {atsResult.score}% ({atsResult.status})
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed"><span className="font-bold text-[#d0bcff]">Feedback:</span> {atsResult.feedback}</p>
                    <div>
                      <p className="font-bold text-white mb-1.5 text-xs">Improvement Items:</p>
                      <ul className="space-y-1 ml-4 list-disc text-gray-400">
                        {atsResult.improvements.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
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
