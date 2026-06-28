/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Upload, HelpCircle, AlertCircle, Sparkles, GitBranch, Layers, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ComparisonPaper {
  id: string;
  name: string;
  methodology: string;
  compute: string;
  parameters: string;
  latency: string;
  readiness: string;
}

const COMPARISON_PAPERS: ComparisonPaper[] = [
  {
    id: "qnd",
    name: "Quantum Neural Decoders v4",
    methodology: "Variational quantum circuits + decoders",
    compute: "34% reduction in parameter space",
    parameters: "142K Qubits",
    latency: "24.5 ms coherence",
    readiness: "Experimental"
  },
  {
    id: "attention",
    name: "Attention Is All You Need",
    methodology: "Multi-head self-attention layers",
    compute: "O(n²) sequence complexity",
    parameters: "65M - 175B params",
    latency: "12.0 ms latency ceiling",
    readiness: "Production Ready"
  },
  {
    id: "tsmc",
    name: "Opt Inference TSMC 4nm",
    methodology: "FP8 vector pipeline compiling",
    compute: "85% cache localization",
    parameters: "Silicon compile",
    latency: "1.4 ms microsecond latency",
    readiness: "Edge Hardware"
  },
  {
    id: "ansatz",
    name: "Variational Ansatz Networks",
    methodology: "Error-correcting ansatz states",
    compute: "Variational adjustment",
    parameters: "240K parameters",
    latency: "45.0 ms coherence decay",
    readiness: "Prototype"
  }
];

interface ResearchWorkspaceProps {
  onGainXp?: (amount: number) => void;
}

export default function ResearchWorkspace({ onGainXp }: ResearchWorkspaceProps) {
  const [uploadedPapers, setUploadedPapers] = useState<string[]>([]);
  const [papers, setPapers] = useState<ComparisonPaper[]>(COMPARISON_PAPERS);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(["qnd", "attention", "tsmc"]);
  const [dragActive, setDragActive] = useState(false);
  const [activeAnalysis, setActiveTab] = useState<'matrix' | 'gap' | null>(null);
  const [analysisText, setAnalysisText] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeNetworkDetail, setActiveNetworkDetail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const names = Array.from(e.dataTransfer.files).map((f: any) => f.name);
      setUploadedPapers(prev => [...prev, ...names]);

      names.forEach(name => {
        const newPaper: ComparisonPaper = {
          id: name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          name: name,
          methodology: "Extracted via Gemini Document Analyzer",
          compute: "Optimal (synthesizing pipeline routes)",
          parameters: "Analyzing weights...",
          latency: "0.8 ms edge execution limit",
          readiness: "Edge Ready"
        };
        setPapers(prev => {
          if (prev.some(p => p.name === name)) return prev;
          return [...prev, newPaper];
        });
        setSelectedPaperIds(prev => [...prev, newPaper.id]);
      });

      if (onGainXp) {
        onGainXp(40);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f: any) => f.name);
      setUploadedPapers(prev => [...prev, ...names]);

      names.forEach(name => {
        const newPaper: ComparisonPaper = {
          id: name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          name: name,
          methodology: "Extracted via Gemini Document Analyzer",
          compute: "Optimal (synthesizing pipeline routes)",
          parameters: "Analyzing weights...",
          latency: "0.8 ms edge execution limit",
          readiness: "Edge Ready"
        };
        setPapers(prev => {
          if (prev.some(p => p.name === name)) return prev;
          return [...prev, newPaper];
        });
        setSelectedPaperIds(prev => [...prev, newPaper.id]);
      });

      if (onGainXp) {
        onGainXp(40);
      }
    }
  };

  const triggerFileInput = (e: React.MouseEvent) => {
    // If clicking on items inside the uploaded files viewer, don't trigger the file dialog
    const target = e.target as HTMLElement;
    if (target.closest('.no-trigger-dialog')) {
      return;
    }
    fileInputRef.current?.click();
  };

  const togglePaper = (id: string) => {
    setSelectedPaperIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const runAnalysisWithGemini = async (tool: 'matrix' | 'gap') => {
    setActiveTab(tool);
    setAnalysisLoading(true);
    setAnalysisText("");
    const papersList = papers.filter(p => selectedPaperIds.includes(p.id)).map(p => p.name).join(", ");

    const prompt = tool === 'matrix' 
      ? `Generate a brief feature comparison matrix analysis (in clear markdown) for these papers: ${papersList}. Contrast methodology, compute efficiency, and deployment readiness.`
      : `Based on current literature in Quantum Neural Networks, identify 3 gaps/novel opportunities. Provide a quick summary of each in clear markdown.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          systemPrompt: "You are an advanced scientific AI research reviewer. Provide dense, high-level structural analysis of scientific literature."
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysisText(data.content || "Could not analyze literature.");
        if (onGainXp) {
          onGainXp(50);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setAnalysisText(`Error running analysis: ${err.message}. Please configure your GEMINI_API_KEY.`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-3xl mx-auto">
      {/* Welcome Header */}
      <section className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold text-white font-sans">Research Workspace</h2>
        <p className="text-gray-500 font-mono text-[10px] uppercase font-bold tracking-widest">Active Project: Quantum Neural Decoders</p>
      </section>

      {/* Upload Zone */}
      <section 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`glass-card rounded-[24px] p-8 border-dashed border-2 text-center space-y-4 hover:border-[#d0bcff]/40 hover:shadow-[0_0_20px_rgba(208,188,255,0.1)] transition-all cursor-pointer group ${
          dragActive ? 'border-[#d0bcff] bg-[#d0bcff]/5' : 'border-white/10'
        }`}
      >
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.tex,.md"
        />
        <div className="w-16 h-16 bg-[#d0bcff]/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
          <Upload className="w-8 h-8 text-[#d0bcff]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white font-sans">Upload Research Paper</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">PDF, LaTeX or MD supported (Max 50MB)</p>
        </div>
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-transform cursor-pointer"
        >
          Browse Files
        </button>

        {uploadedPapers.length > 0 && (
          <div className="no-trigger-dialog mt-4 p-3 bg-black/40 rounded-xl border border-white/5 text-left text-[11px] font-mono text-gray-400 space-y-1 max-h-24 overflow-y-auto">
            <p className="font-bold text-[#d0bcff]">Uploaded Research Papers:</p>
            {uploadedPapers.map((p, idx) => (
              <p key={idx} className="truncate">✓ {p}</p>
            ))}
          </div>
        )}
      </section>

      {/* Analysis Tools Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Analysis Tools</h3>
          <span className="text-[#d0bcff] text-xs font-semibold">3 Active</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Comparison Matrix */}
          <div 
            onClick={() => runAnalysisWithGemini('matrix')}
            className="glass-card rounded-[24px] p-5 space-y-3 cursor-pointer border border-white/5 hover:border-[#4cd7f6]/30 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#4cd7f6]/10 rounded-xl border border-[#4cd7f6]/20">
                <span className="material-symbols-outlined text-[#4cd7f6] text-xl">grid_view</span>
              </div>
              <h4 className="font-semibold text-white text-sm">Comparison Matrix</h4>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">Automated feature alignment across 12 source papers.</p>
            <div className="flex items-center -space-x-2.5">
              <div className="w-6 h-6 rounded-full border border-[#131313] bg-indigo-500/40"></div>
              <div className="w-6 h-6 rounded-full border border-[#131313] bg-[#4cd7f6]/40"></div>
              <div className="w-6 h-6 rounded-full border border-[#131313] bg-[#ffd9e4]/40 flex items-center justify-center text-[9px] font-mono text-white font-bold bg-[#353534]">
                +9
              </div>
            </div>
          </div>

          {/* Gap Detector */}
          <div 
            onClick={() => runAnalysisWithGemini('gap')}
            className="glass-card rounded-[24px] p-5 space-y-3 cursor-pointer border border-white/5 hover:border-[#f751a1]/30 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f751a1]/10 rounded-xl border border-[#f751a1]/20">
                <span className="material-symbols-outlined text-[#f751a1] text-xl">query_stats</span>
              </div>
              <h4 className="font-semibold text-white text-sm">Gap Detector</h4>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-[#f751a1] rounded-full shadow-[0_0_10px_rgba(247,81,161,0.5)]"></div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">6 novel research opportunities identified in current literature.</p>
          </div>

          {/* Citation Network (Interactive graph) */}
          <div className="glass-card rounded-[24px] p-5 space-y-4 overflow-hidden border border-white/5 hover:border-[#d0bcff]/30 transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#d0bcff]/10 rounded-xl border border-[#d0bcff]/20">
                <span className="material-symbols-outlined text-[#d0bcff] text-xl">hub</span>
              </div>
              <h4 className="font-semibold text-white text-sm">Citation Network</h4>
            </div>

            {/* Live Interactive SVG Graph */}
            <div className="h-36 w-full bg-black/10 rounded-xl relative overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <line x1="50%" y1="50%" x2="25%" y2="30%" stroke="#4cd7f6" strokeWidth="1" strokeDasharray="3 2" />
                <line x1="50%" y1="50%" x2="75%" y2="40%" stroke="#ffd9e4" strokeWidth="1" strokeDasharray="3 2" />
                <line x1="50%" y1="50%" x2="62%" y2="80%" stroke="#f751a1" strokeWidth="1.5" />
              </svg>

              {/* Central Node */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-4 h-4 bg-[#d0bcff] rounded-full z-10 shadow-[0_0_15px_rgba(208,188,255,0.8)] cursor-pointer"
                onClick={() => setActiveNetworkDetail("Central paper node: Quantum Decoders Architecture")}
              />

              {/* Orbiting nodes */}
              <div 
                className="absolute top-10 left-1/4 w-2.5 h-2.5 bg-[#4cd7f6] rounded-full cursor-pointer shadow-[0_0_10px_rgba(76,215,246,0.6)]"
                onClick={() => setActiveNetworkDetail("Node: TSMC Edge-Inference report (linked)")}
              />
              <div 
                className="absolute bottom-6 right-1/3 w-3.5 h-3.5 bg-[#ffd9e4] rounded-full cursor-pointer shadow-[0_0_10px_rgba(255,217,228,0.6)]"
                onClick={() => setActiveNetworkDetail("Node: Attention is All You Need baseline")}
              />
              <div 
                className="absolute top-14 right-10 w-2 h-2 bg-gray-500 rounded-full cursor-pointer"
                onClick={() => setActiveNetworkDetail("Node: Isolated baseline metadata")}
              />

              {activeNetworkDetail && (
                <div className="absolute inset-x-2 bottom-2 bg-slate-950/95 border border-[#d0bcff]/30 rounded-xl px-3 py-1.5 text-[10px] font-mono text-gray-300 flex items-center justify-between shadow-2xl z-20">
                  <span className="truncate">{activeNetworkDetail}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveNetworkDetail(null); }} 
                    className="text-[#f751a1] hover:text-white ml-2 text-xs font-bold font-mono"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <button 
              type="button"
              onClick={() => setActiveNetworkDetail("Generating citation mapping report... Connected nodes: 48.")}
              className="w-full text-center text-[#d0bcff] text-xs font-bold hover:underline cursor-pointer"
            >
              Expand Visualization
            </button>
          </div>
        </div>
      </section>

      {/* Render AI Analysis results from Tools */}
      <AnimatePresence>
        {activeAnalysis && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-3xl bg-white/5 border border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-mono font-bold text-[#4cd7f6] uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse" />
                {activeAnalysis === 'matrix' ? 'Active Comparative Matrix' : 'AI Literature Gap Report'}
              </h4>
              <button 
                onClick={() => setActiveTab(null)}
                className="text-gray-500 hover:text-white text-xs font-bold font-mono px-2 py-1 bg-white/5 rounded-lg"
              >
                Close
              </button>
            </div>

            {activeAnalysis === 'matrix' ? (
              <div className="space-y-4">
                <p className="text-gray-400 text-xs leading-relaxed">Toggle papers to instantly adjust columns and align features:</p>
                <div className="flex flex-wrap gap-2 mb-2 no-trigger-dialog">
                  {papers.map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePaper(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        selectedPaperIds.includes(p.id)
                          ? "bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/30 shadow-md shadow-[#4cd7f6]/5"
                          : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {selectedPaperIds.includes(p.id) ? "✓ " : "+ "} {p.name}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto border border-white/5 rounded-2xl bg-black/30">
                  <table className="w-full text-left border-collapse text-[11px] min-w-[500px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.03] font-mono text-gray-400 font-semibold uppercase tracking-wider text-[9px]">
                        <th className="p-3">Research Paper</th>
                        <th className="p-3">Core Methodology</th>
                        <th className="p-3">Compute Efficiency</th>
                        <th className="p-3">Parameters</th>
                        <th className="p-3">Latency Limit</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {papers.filter(p => selectedPaperIds.includes(p.id)).map(p => (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 font-semibold text-white font-sans">{p.name}</td>
                          <td className="p-3 text-gray-300">{p.methodology}</td>
                          <td className="p-3 text-gray-300">{p.compute}</td>
                          <td className="p-3 text-gray-400 font-mono">{p.parameters}</td>
                          <td className="p-3 text-[#4cd7f6] font-mono">{p.latency}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                              p.readiness === "Production Ready" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              p.readiness === "Edge Hardware" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            }`}>
                              {p.readiness}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] font-mono uppercase text-[#d0bcff] tracking-wider mb-2 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Synthesis:
                  </p>
                  {analysisLoading ? (
                    <div className="text-xs font-mono text-gray-500 py-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#d0bcff] animate-spin" />
                      Gemini is generating feature alignment report...
                    </div>
                  ) : (
                    <div className="text-xs leading-relaxed text-gray-300 font-sans whitespace-pre-wrap max-h-56 overflow-y-auto bg-white/[0.01] p-3 rounded-xl border border-white/5">
                      {analysisText || "Select the papers above and trigger Comparison Matrix again to refresh AI synthesis."}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Gap detector
              <div>
                {analysisLoading ? (
                  <div className="text-xs font-mono text-gray-500 py-4 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#d0bcff] animate-spin" />
                    Gemini is synthesizing gaps...
                  </div>
                ) : (
                  <div className="text-xs leading-relaxed text-gray-300 font-sans whitespace-pre-wrap max-h-56 overflow-y-auto bg-white/[0.01] p-3 rounded-xl border border-white/5">
                    {analysisText}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Research Timeline */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-white">Research History</h3>
        <div className="relative border-l border-white/10 pl-6 ml-3 space-y-8 py-2">
          {/* Step 1 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-2 h-2 bg-[#d0bcff] rounded-full shadow-[0_0_8px_rgba(208,188,255,0.6)]"></div>
            <div className="space-y-1">
              <span className="text-gray-500 font-mono text-[10px]">Today, 10:45 AM</span>
              <h5 className="font-semibold text-white text-sm">Hypothesis Generation</h5>
              <p className="text-gray-400 text-xs leading-relaxed">Refined AI ethics constraints for neural decoding protocols.</p>
            </div>
          </div>
          {/* Step 2 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-2 h-2 bg-white/20 rounded-full"></div>
            <div className="space-y-1">
              <span className="text-gray-500 font-mono text-[10px]">Yesterday</span>
              <h5 className="font-semibold text-white text-sm">Source Synthesis</h5>
              <p className="text-gray-400 text-xs leading-relaxed">Combined "Attention is All You Need" with 4 relevant neuro-studies.</p>
            </div>
          </div>
          {/* Step 3 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-2 h-2 bg-white/20 rounded-full"></div>
            <div className="space-y-1">
              <span className="text-gray-500 font-mono text-[10px]">Oct 24, 2024</span>
              <h5 className="font-semibold text-white text-sm">Initial Scoping</h5>
              <p className="text-gray-400 text-xs leading-relaxed">Defined project boundaries and key performance indicators.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
