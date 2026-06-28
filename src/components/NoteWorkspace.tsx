/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Sparkles, Brain, CheckCircle2, ChevronRight, FileText, HelpCircle, Layers, Plus, BookOpen, AlertCircle, Download, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Note, Quiz, Flashcard } from "../types";
import { jsPDF } from "jspdf";

interface NoteWorkspaceProps {
  note: Note;
  onUpdateNote: (updatedNote: Note) => void;
  onGainXp?: (amount: number) => void;
}

interface MindNode {
  id: string;
  label: string;
  x: number;
  y: number;
  description: string;
  category: string;
}

interface MindLink {
  source: string;
  target: string;
}

const NEUROSCIENCE_NODES: MindNode[] = [
  { id: "n1", label: "Neuroplasticity", x: 120, y: 150, description: "The brain's ability to reorganize itself by forming new neural connections throughout life in response to learning.", category: "Core Concept" },
  { id: "n2", label: "Synaptic Pruning", x: 260, y: 80, description: "The natural process wherein the brain eliminates extra synapses to increase efficiency of remaining neural transmissions.", category: "Biological Process" },
  { id: "n3", label: "Action Potential", x: 260, y: 220, description: "The change in electrical potential associated with the passage of an impulse along the membrane of a nerve cell.", category: "Electrophysiology" },
  { id: "n4", label: "LTP (Long-Term Potentiation)", x: 400, y: 150, description: "A persistent strengthening of synapses based on recent patterns of activity, forming the neural basis for memory.", category: "Mechanisms" }
];

const NEUROSCIENCE_LINKS: MindLink[] = [
  { source: "n1", target: "n2" },
  { source: "n1", target: "n3" },
  { source: "n3", target: "n4" }
];

const CALCULUS_NODES: MindNode[] = [
  { id: "c1", label: "Partial Derivatives", x: 120, y: 150, description: "The derivative of a multivariable function with respect to one variable, holding other variables constant.", category: "Core Operations" },
  { id: "c2", label: "Gradient Vector", x: 260, y: 80, description: "A vector of partial derivatives, pointing in the direction of steepest ascent of the multivariable function.", category: "Vector Fields" },
  { id: "c3", label: "Double Integrals", x: 260, y: 220, description: "Integration over two-dimensional regions, yielding volume beneath multivariable surfaces.", category: "Integration" },
  { id: "c4", label: "Green's Theorem", x: 400, y: 150, description: "A fundamental theorem relating line integrals around a simple closed curve to double integrals over the planar region bounds.", category: "Integral Theorems" }
];

const CALCULUS_LINKS: MindLink[] = [
  { source: "c1", target: "c2" },
  { source: "c1", target: "c3" },
  { source: "c2", target: "c4" },
  { source: "c3", target: "c4" }
];

export default function NoteWorkspace({ note, onUpdateNote, onGainXp }: NoteWorkspaceProps) {
  const [formatMode, setFormatMode] = useState<'mcq' | 'flashcard'>('mcq');
  const [quizLoading, setQuizLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeFlashcards, setActiveFlashcards] = useState<Flashcard[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Mind map states
  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  const [mapNodes, setMapNodes] = useState<MindNode[]>([]);
  const [mapLinks, setMapLinks] = useState<MindLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<MindNode | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [aiExpanding, setAiExpanding] = useState(false);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleExportMarkdown = () => {
    const mdContent = `# ${note.title || "Untitled Note"}\n\n` +
      `*Last Edited: ${new Date().toLocaleDateString()}*\n\n` +
      `## Content\n\n${note.content || ""}\n\n` +
      (note.links.length > 0 ? `## Linked Topics\n${note.links.map(l => `- ${l}`).join('\n')}\n\n` : '') +
      `---\n*Synthesized in OmniMind AI Study Workspace*`;

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(note.title || "study_note").toLowerCase().replace(/\s+/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast("Note successfully exported as Markdown! +15 XP");
    if (onGainXp) onGainXp(15);
    localStorage.setItem("omnimind_badge_exported", "true");
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 30, 40);
      doc.text(note.title || "Untitled Note", 20, 30);
      
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 130);
      doc.text(`Last Edited: ${new Date().toLocaleDateString()} • Generated in OmniMind`, 20, 38);
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, 43, 190, 43);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 70);
      
      const contentLines = doc.splitTextToSize(note.content || "No content drafted yet.", 170);
      let yPos = 52;
      
      contentLines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 7;
      });
      
      if (note.links.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        yPos += 10;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 40);
        doc.text("Linked Topics", 20, yPos);
        yPos += 8;
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 90);
        
        note.links.forEach((link: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`• ${link}`, 25, yPos);
          yPos += 6;
        });
      }
      
      doc.save(`${(note.title || "study_note").toLowerCase().replace(/\s+/g, "_")}.pdf`);
      triggerToast("Note successfully exported as PDF! +20 XP");
      if (onGainXp) onGainXp(20);
      localStorage.setItem("omnimind_badge_exported", "true");
    } catch (err) {
      console.error("PDF generation failed:", err);
      triggerToast("Failed to generate PDF. Downloading Markdown fallback...");
      handleExportMarkdown();
    }
  };

  // Drag handlers
  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNodeId(id);
    const selected = mapNodes.find(n => n.id === id);
    if (selected) {
      setSelectedNode(selected);
    }
  };

  const handleNodeTouchStart = (id: string, e: React.TouchEvent) => {
    e.stopPropagation();
    setDraggingNodeId(id);
    const selected = mapNodes.find(n => n.id === id);
    if (selected) {
      setSelectedNode(selected);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNodeId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(20, Math.min(rect.width - 20, e.clientX - rect.left));
      const y = Math.max(20, Math.min(rect.height - 20, e.clientY - rect.top));
      setMapNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x, y } : n));
      // Sync selected node coordinates as well
      setSelectedNode(prev => prev && prev.id === draggingNodeId ? { ...prev, x, y } : prev);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (draggingNodeId && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(20, Math.min(rect.width - 20, touch.clientX - rect.left));
      const y = Math.max(20, Math.min(rect.height - 20, touch.clientY - rect.top));
      setMapNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x, y } : n));
      // Sync selected node coordinates as well
      setSelectedNode(prev => prev && prev.id === draggingNodeId ? { ...prev, x, y } : prev);
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleAddCustomNode = () => {
    if (!newNodeLabel.trim() || !selectedNode) return;
    const newId = "custom_" + Date.now();
    
    // Position it slightly offset from the parent
    const newNode: MindNode = {
      id: newId,
      label: newNodeLabel,
      x: Math.max(40, Math.min(460, selectedNode.x + (Math.random() * 80 - 40))),
      y: Math.max(40, Math.min(260, selectedNode.y + (Math.random() * 80 - 40))),
      description: `User added concept exploring the connection to ${selectedNode.label}.`,
      category: "Custom Addition"
    };

    setMapNodes(prev => [...prev, newNode]);
    setMapLinks(prev => [...prev, { source: selectedNode.id, target: newId }]);
    setSelectedNode(newNode);
    setNewNodeLabel("");
    localStorage.setItem("omnimind_badge_mapped", "true");
    if (onGainXp) {
      onGainXp(20);
    }
  };

  const handleAiExpandNodes = async () => {
    if (!selectedNode) return;
    setAiExpanding(true);
    
    // Simulate smart AI node expansion based on current topic and selected node
    setTimeout(() => {
      const parentId = selectedNode.id;
      const subNodes: MindNode[] = [
        {
          id: `ai_${Date.now()}_1`,
          label: `Advanced ${selectedNode.label}`,
          x: Math.max(40, Math.min(460, selectedNode.x + 80)),
          y: Math.max(40, Math.min(260, selectedNode.y - 40)),
          description: `An automated depth concept exploring the mathematical or practical limits of ${selectedNode.label}.`,
          category: "AI Extraction"
        },
        {
          id: `ai_${Date.now()}_2`,
          label: `${selectedNode.label} Application`,
          x: Math.max(40, Math.min(460, selectedNode.x + 80)),
          y: Math.max(40, Math.min(260, selectedNode.y + 40)),
          description: `Standard applications, edge-cases, and engineering setups derived from ${selectedNode.label}.`,
          category: "Applications"
        }
      ];

      setMapNodes(prev => [...prev, ...subNodes]);
      setMapLinks(prev => [
        ...prev,
        { source: parentId, target: subNodes[0].id },
        { source: parentId, target: subNodes[1].id }
      ]);
      
      setSelectedNode(subNodes[0]);
      setAiExpanding(false);
      localStorage.setItem("omnimind_badge_mapped", "true");
      if (onGainXp) {
        onGainXp(40);
      }
    }, 1500);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Markdown formatting utility helper
  const applyFormat = (syntax: string, placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || placeholder;

    let replacement = "";
    if (syntax === "list") {
      replacement = `\n- ${selected}`;
    } else if (syntax === "code") {
      replacement = `\`${selected}\``;
    } else if (syntax === "bold") {
      replacement = `**${selected}**`;
    } else if (syntax === "italic") {
      replacement = `*${selected}*`;
    } else {
      replacement = syntax + selected;
    }

    const updatedText = text.substring(0, start) + replacement + text.substring(end);
    onUpdateNote({
      ...note,
      content: updatedText
    });

    // Reset selection focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 100);
  };

  const handleLinkInsight = () => {
    if (note.links.includes("Gradient Descent")) {
      triggerToast("Gradient Descent note is already linked to this active session.");
      return;
    }
    onUpdateNote({
      ...note,
      links: [...note.links, "Gradient Descent"]
    });
    triggerToast("Linked session: 'Gradient Descent' successfully added to connection network!");
  };

  const generateSmartSession = async () => {
    setQuizLoading(true);
    setError("");
    setActiveQuiz(null);
    setActiveFlashcards(null);
    setUserAnswers({});
    setRevealedAnswers({});
    setFlippedCards({});
    setActiveCardIndex(0);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteContent: note.content,
          noteTitle: note.title,
          format: formatMode
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate smart learning session.");
      }

      if (formatMode === 'flashcard') {
        setActiveFlashcards(data.flashcards || []);
      } else {
        setActiveQuiz(data);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred generating the session.");
    } finally {
      setQuizLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Quick Stats / Daily Mastery progress */}
      <section className="glass-card p-6 rounded-[24px]">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Daily Mastery</h2>
            <p className="text-xs text-gray-400 mt-0.5">You're 82% towards your goal</p>
          </div>
          <span className="font-mono text-xl font-semibold text-[#4cd7f6]">82%</span>
        </div>

        {/* Progress Timeline */}
        <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden mb-6">
          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] rounded-full" style={{ width: "82%" }}></div>
        </div>

        <div className="flex justify-between items-center text-center">
          {[
            { label: "Mon", fill: "60%" },
            { label: "Tue", fill: "40%" },
            { label: "Wed", fill: "90%" },
            { label: "Thu", fill: "82%", active: true },
            { label: "Fri", fill: "0%", future: true },
            { label: "Sat", fill: "0%", future: true },
            { label: "Sun", fill: "0%", future: true }
          ].map((day, idx) => (
            <div key={idx} className={`flex flex-col items-center ${day.future ? 'opacity-40' : ''}`}>
              <span className={`text-[11px] font-medium ${day.active ? 'text-[#d0bcff] font-bold' : 'text-gray-400'}`}>{day.label}</span>
              <div className="w-2 h-8 bg-white/5 rounded-full mt-2 relative overflow-hidden">
                {!day.future && (
                  <div className="absolute bottom-0 w-full bg-[#d0bcff] rounded-full" style={{ height: day.fill }}></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editor Content Area */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Active Session</h3>
          <span className="bg-[#d0bcff]/10 text-[#d0bcff] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#d0bcff]/20 animate-pulse">AI Syncing</span>
        </div>

        <div className="glass-card rounded-[24px] p-6 flex flex-col gap-5 border border-white/5">
          <input 
            type="text" 
            value={note.title}
            onChange={(e) => onUpdateNote({ ...note, title: e.target.value })}
            placeholder="Enter title..."
            className="bg-transparent border-none focus:ring-0 text-xl font-bold text-white p-0 w-full focus:outline-none"
          />

          {/* Form toolbar helpers with Export Actions */}
          <div id="note-toolbar-container" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto pb-2 border-b border-white/5">
            <div id="formatting-group" className="flex gap-2 items-center flex-wrap">
              <button 
                id="btn-format-bold"
                type="button"
                onClick={() => applyFormat("bold", "text")}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-semibold hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Bold
              </button>
              <button 
                id="btn-format-italic"
                type="button"
                onClick={() => applyFormat("italic", "text")}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-semibold hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Italic
              </button>
              <button 
                id="btn-format-list"
                type="button"
                onClick={() => applyFormat("list", "Item")}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-semibold hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Bullet List
              </button>
              <button 
                id="btn-format-code"
                type="button"
                onClick={() => applyFormat("code", "code")}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-semibold hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Code
              </button>
            </div>

            <div id="export-actions-group" className="flex gap-2 items-center">
              <button
                id="btn-export-markdown"
                type="button"
                onClick={handleExportMarkdown}
                title="Export as Markdown (.md)"
                className="px-3 py-1.5 rounded-lg bg-[#d0bcff]/10 hover:bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/20 text-xs font-bold active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export MD</span>
              </button>
              <button
                id="btn-export-pdf"
                type="button"
                onClick={handleExportPdf}
                title="Export as formatted PDF (.pdf)"
                className="px-3 py-1.5 rounded-lg bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/20 text-xs font-bold active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          <textarea 
            ref={textareaRef}
            rows={8}
            value={note.content}
            onChange={(e) => onUpdateNote({ ...note, content: e.target.value })}
            placeholder="Start drafting study notes..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm focus:outline-none text-gray-300 leading-relaxed font-sans resize-none"
          />

          {/* Interactive linking bento insight alert */}
          <div className="p-4 rounded-2xl bg-[#d0bcff]/5 border border-[#d0bcff]/20 border-dashed">
            <p className="text-xs text-[#d0bcff] italic leading-relaxed">
              "AI Insight: This paragraph relates to your previous note on <span className="underline font-semibold cursor-pointer" onClick={handleLinkInsight}>Gradient Descent</span>. Would you like to link them?"
            </p>
            {note.links.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {note.links.map((link, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-full bg-[#d0bcff]/20 text-[#d0bcff] text-[10px] font-semibold flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5" />
                    {link}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quiz Wizard Setup Panel */}
      <section className="glass-card rounded-[24px] p-6 border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/40 flex items-center justify-center border border-cyan-800/20 text-[#4cd7f6]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Quiz Wizard</h4>
            <p className="text-xs text-gray-400">Generate practice from notes</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => setFormatMode('mcq')}
            className={`p-4 rounded-2xl flex items-center justify-between border cursor-pointer transition-all ${
              formatMode === 'mcq' ? 'border-[#d0bcff]/30 bg-white/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/5'
            }`}
          >
            <span className="text-xs font-semibold text-white">Multiple Choice</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button 
            type="button"
            onClick={() => setFormatMode('flashcard')}
            className={`p-4 rounded-2xl flex items-center justify-between border cursor-pointer transition-all ${
              formatMode === 'flashcard' ? 'border-[#d0bcff]/30 bg-white/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/5'
            }`}
          >
            <span className="text-xs font-semibold text-white">Flashcard Deck</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-xs flex items-center gap-2 px-2 py-1 bg-red-950/20 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button 
          onClick={generateSmartSession}
          disabled={quizLoading}
          className="w-full py-3.5 bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#d0bcff]/10"
        >
          <Sparkles className="w-4 h-4" />
          {quizLoading ? "Gemini wizard is working..." : "Generate Smart Session"}
        </button>

        {/* Live Quiz Board Display */}
        <AnimatePresence>
          {activeQuiz && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 border-t border-white/5 pt-6 space-y-6"
            >
              <h5 className="font-bold text-white text-sm">Interactive Quiz: {activeQuiz.title}</h5>
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  <p className="text-sm font-semibold text-gray-200">{qIdx + 1}. {q.question}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[qIdx] === optIdx;
                      const isRevealed = revealedAnswers[qIdx];
                      const isCorrect = optIdx === q.correctAnswerIndex;

                      let btnStyle = "border-white/5 bg-white/[0.01] hover:bg-white/5";
                      if (isSelected) {
                        btnStyle = isRevealed 
                          ? isCorrect ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"
                          : "border-[#d0bcff]/40 bg-[#d0bcff]/10 text-white";
                      } else if (isRevealed && isCorrect) {
                        btnStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isRevealed}
                          onClick={() => {
                            setUserAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                            setRevealedAnswers(prev => ({ ...prev, [qIdx]: true }));
                            if (onGainXp) {
                              onGainXp(isCorrect ? 35 : 10);
                            }
                          }}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {revealedAnswers[qIdx] && (
                    <p className="text-[11px] text-gray-400 font-medium italic mt-2">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeFlashcards && activeFlashcards.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 border-t border-white/5 pt-6 flex flex-col items-center gap-4"
            >
              <h5 className="font-bold text-white text-sm text-center">Interactive Flashcards</h5>
              
              {/* Flashcard Frame */}
              <div 
                onClick={() => {
                  setFlippedCards(prev => ({ ...prev, [activeCardIndex]: !prev[activeCardIndex] }));
                  if (onGainXp) {
                    onGainXp(15);
                  }
                }}
                className="w-full max-w-sm h-48 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-6 text-center cursor-pointer relative overflow-hidden transition-all hover:border-[#d0bcff]/30 shadow-inner"
              >
                <div className="absolute top-2 right-2 text-[10px] font-mono text-gray-500">
                  Card {activeCardIndex + 1} of {activeFlashcards.length}
                </div>
                <div className="font-medium text-sm leading-relaxed text-gray-200 font-sans">
                  {flippedCards[activeCardIndex] ? (
                    <div>
                      <p className="text-xs uppercase font-mono text-[#4cd7f6] mb-2">Back / Answer</p>
                      <p>{activeFlashcards[activeCardIndex].back}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs uppercase font-mono text-[#d0bcff] mb-2">Front / Concept</p>
                      <p>{activeFlashcards[activeCardIndex].front}</p>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 text-[10px] text-gray-500 font-mono italic">
                  Tap card to flip
                </div>
              </div>

              {/* Card Controls */}
              <div className="flex gap-4">
                <button 
                  disabled={activeCardIndex === 0}
                  onClick={() => setActiveCardIndex(idx => Math.max(0, idx - 1))}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
                >
                  Previous
                </button>
                <button 
                  disabled={activeCardIndex === activeFlashcards.length - 1}
                  onClick={() => setActiveCardIndex(idx => Math.min(activeFlashcards.length - 1, idx + 1))}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Mind Map Connection Node Panel */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white font-sans">Knowledge Maps</h3>
          {activeMapId && (
            <button 
              onClick={() => {
                setActiveMapId(null);
                setSelectedNode(null);
              }}
              className="text-xs font-mono text-[#d0bcff] hover:underline cursor-pointer bg-white/5 px-2 py-1 rounded-lg"
            >
              ← Back to Maps
            </button>
          )}
        </div>

        {!activeMapId ? (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 scroll-smooth">
            <div 
              onClick={() => {
                setMapNodes(NEUROSCIENCE_NODES);
                setMapLinks(NEUROSCIENCE_LINKS);
                setActiveMapId("neuroscience");
                setSelectedNode(NEUROSCIENCE_NODES[0]);
              }}
              className="min-w-[200px] h-32 glass-card p-5 flex flex-col justify-between relative overflow-hidden group border border-white/5 hover:border-[#d0bcff]/30 cursor-pointer transition-all"
            >
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-5xl">hub</span>
              </div>
              <span className="font-bold text-white text-sm font-sans">Neuroscience</span>
              <span className="text-xs text-gray-500 font-mono">4 Nodes • Active Canvas</span>
            </div>

            <div 
              onClick={() => {
                setMapNodes(CALCULUS_NODES);
                setMapLinks(CALCULUS_LINKS);
                setActiveMapId("calculus");
                setSelectedNode(CALCULUS_NODES[0]);
              }}
              className="min-w-[200px] h-32 glass-card p-5 flex flex-col justify-between relative overflow-hidden group border border-white/5 hover:border-[#d0bcff]/30 cursor-pointer transition-all"
            >
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-5xl">functions</span>
              </div>
              <span className="font-bold text-white text-sm font-sans">Calculus III</span>
              <span className="text-xs text-gray-500 font-mono">4 Nodes • Active Canvas</span>
            </div>

            <div 
              onClick={() => {
                const rootNode: MindNode = {
                  id: "root",
                  label: note.title || "My Study Note",
                  x: 250,
                  y: 150,
                  description: "The primary root of your custom knowledge base.",
                  category: "Root Concept"
                };
                setMapNodes([rootNode]);
                setMapLinks([]);
                setActiveMapId("new_custom");
                setSelectedNode(rootNode);
              }}
              className="min-w-[200px] h-32 glass-card p-5 flex flex-col items-center justify-center gap-2 border-dashed border-2 border-white/10 text-gray-500 hover:text-white cursor-pointer hover:border-white/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-mono font-bold tracking-wide uppercase">New Map</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual SVGSVG Interactive Canvas */}
            <div className="md:col-span-2 relative h-80 rounded-[24px] border border-white/10 bg-black/40 overflow-hidden group select-none">
              <p className="absolute top-3 left-3 text-[10px] font-mono text-gray-400 z-10 uppercase tracking-widest bg-black/60 px-2 py-1 rounded-md">
                Interactive Mind Map • Drag nodes to reposition
              </p>
              
              <svg 
                className="w-full h-full cursor-crosshair touch-none"
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={handleCanvasMouseUp}
              >
                {/* Lines / Connections */}
                {mapLinks.map((link, idx) => {
                  const sourceNode = mapNodes.find(n => n.id === link.source);
                  const targetNode = mapNodes.find(n => n.id === link.target);
                  if (!sourceNode || !targetNode) return null;
                  return (
                    <line 
                      key={idx}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      className="stroke-[#d0bcff]/40 stroke-2"
                    />
                  );
                })}

                {/* Nodes rendering */}
                {mapNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <g 
                      key={node.id}
                      className="cursor-pointer"
                      onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                      onTouchStart={(e) => handleNodeTouchStart(node.id, e)}
                    >
                      {/* Outer Pulse */}
                      {isSelected && (
                        <circle 
                          cx={node.x}
                          cy={node.y}
                          r="25"
                          className="fill-transparent stroke-[#4cd7f6]/30 stroke-2 animate-ping"
                        />
                      )}
                      
                      <circle 
                        cx={node.x}
                        cy={node.y}
                        r="18"
                        className={`transition-all duration-100 ${
                          isSelected 
                            ? "fill-[#4cd7f6]/15 stroke-[#4cd7f6] stroke-3" 
                            : "fill-[#1c1b1b] stroke-[#d0bcff] stroke-2 hover:stroke-white"
                        }`}
                      />
                      
                      <text 
                        x={node.x}
                        y={node.y + 30}
                        textAnchor="middle"
                        className="fill-white text-[10px] font-sans font-medium pointer-events-none select-none bg-black/80"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Sidebar Controls Panel */}
            <div className="glass-card p-5 rounded-[24px] space-y-4 border border-white/5 flex flex-col justify-between">
              {selectedNode ? (
                <div className="space-y-3">
                  <span className="bg-[#d0bcff]/10 text-[#d0bcff] text-[9px] font-bold font-mono uppercase tracking-widest px-2.5 py-1 rounded-md border border-[#d0bcff]/20">
                    {selectedNode.category}
                  </span>
                  <h4 className="text-base font-bold text-white font-sans">{selectedNode.label}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">{selectedNode.description}</p>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-500 font-mono">
                  Select a node to inspect and expand connections.
                </div>
              )}

              {/* Add Custom connected node form */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <p className="text-[10px] font-mono uppercase text-gray-500 tracking-wider font-bold">Add Connected Node:</p>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="New concept..."
                    value={newNodeLabel}
                    onChange={(e) => setNewNodeLabel(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                  />
                  <button 
                    onClick={handleAddCustomNode}
                    className="px-3 py-1.5 bg-[#4cd7f6]/20 hover:bg-[#4cd7f6]/30 text-[#4cd7f6] border border-[#4cd7f6]/30 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* AI Node Generator */}
                <button 
                  onClick={handleAiExpandNodes}
                  disabled={aiExpanding}
                  className="w-full py-2 bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#d0bcff]/5 disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiExpanding ? "AI Analyzing..." : "AI Auto-Expand Map"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0f]/95 border border-[#d0bcff]/40 text-xs text-white px-4 py-2.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center gap-2 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#d0bcff]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
