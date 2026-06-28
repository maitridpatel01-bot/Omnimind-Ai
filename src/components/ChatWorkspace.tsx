/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Image, Mic, Sparkles, Terminal, BookOpen, DollarSign, Palette, FlaskConical, Globe, Video, FolderGit, MessageSquare, Plus, PlusCircle, Check, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatSession, Message, Expert } from "../types";

interface ChatWorkspaceProps {
  sessions: ChatSession[];
  selectedSessionId: string | null;
  onNewSession: (expertId: string) => void;
  onSendMessage: (sessionId: string, text: string) => void;
  onUpdateSessionMessages: (sessionId: string, messages: Message[]) => void;
  onGainXp?: (amount: number) => void;
}

export default function ChatWorkspace({
  sessions,
  selectedSessionId,
  onNewSession,
  onSendMessage,
  onUpdateSessionMessages,
  onGainXp
}: ChatWorkspaceProps) {
  const [inputText, setInputText] = useState("");
  const [selectedExpertId, setSelectedExpertId] = useState("architect");
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [voiceQueryText, setVoiceQueryText] = useState("Listening for your voice...");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Photo Upload States
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        setVoiceQueryText("Listening... Speak into your microphone.");
      };

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setVoiceQueryText(currentText);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech error:", event.error);
        if (event.error === "not-allowed") {
          setVoiceQueryText("Microphone permission denied. Ensure it is enabled, or use a suggestion.");
        } else {
          setVoiceQueryText("Could not connect audio. Try again, or use a suggestion below.");
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const startVoiceRecording = () => {
    setShowVoiceOverlay(true);
    setVoiceQueryText("Listening for your voice...");
    if (recognition) {
      try {
        recognition.start();
      } catch (err) {
        console.warn("Speech recognition already running:", err);
      }
    } else {
      setVoiceQueryText("Speech recognition is not supported in this browser. Please use a suggestion!");
    }
  };

  const stopVoiceRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.warn(err);
      }
    }
    setIsRecording(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const experts: Expert[] = [
    {
      id: "architect",
      name: "Lead Architect",
      title: "Active Core Expert",
      avatar: "terminal",
      description: "Full-stack development, system design, and debugging.",
      longDescription: "Deep technical insight in low-latency and scalable deployments.",
      accent: "#d0bcff",
      icon: "terminal",
      systemPrompt: "You are the OmniMind Lead Architect. Speak with absolute technical precision. Give concise, highly optimized code snippets and architectural advice."
    },
    {
      id: "academic",
      name: "Academic",
      title: "Research & Education",
      avatar: "school",
      description: "Explaining scientific concepts and structured tutoring.",
      longDescription: "Master educator specializing in quantum physics, math, and STEM.",
      accent: "#4cd7f6",
      icon: "school",
      systemPrompt: "You are the OmniMind Academic Mentor. You explain extremely complex physical, scientific, or mathematical concepts using simple, elegant analogies."
    },
    {
      id: "finance",
      name: "Finance Expert",
      title: "Markets & Modelling",
      avatar: "payments",
      description: "Venture financials, projections, and token economics.",
      longDescription: "Strategic analyst modeling monetization schedules and runway metrics.",
      accent: "#ffd9e4",
      icon: "payments",
      systemPrompt: "You are the OmniMind Finance Strategist. You advise on venture modeling, tokenomics, series structuring, and metrics, emphasizing viability and runway."
    },
    {
      id: "design",
      name: "Design Lead",
      title: "UX & Interfaces",
      avatar: "palette",
      description: "Glassmorphism, design systems, and visual rhythms.",
      longDescription: "Curator of 'Translucent Intelligence' spacing, hierarchy, and fonts.",
      accent: "#a078ff",
      icon: "palette",
      systemPrompt: "You are the OmniMind Design Director. You focus on aesthetic pairings, spacing, layout hierarchy, modern minimalist UI/UX, and CSS/Tailwind recommendations."
    },
    {
      id: "research",
      name: "Bio-Analyst",
      title: "Pattern Detection",
      avatar: "science",
      description: "Decoding complex structures with high inference accuracy.",
      longDescription: "Analytical scientist synthesizing bio-patterns and synthesis models.",
      accent: "#ffb0cd",
      icon: "science",
      systemPrompt: "You are Sera, the OmniMind Bio-Analyst. Speak precisely about molecular patterns, biological literature synthesis, and diagnostic inference models."
    }
  ];

  const currentExpert = experts.find(e => e.id === selectedExpertId) || experts[0];

  // Retrieve current active session
  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  useEffect(() => {
    if (activeSession?.expertId) {
      setSelectedExpertId(activeSession.expertId);
    }
  }, [activeSession?.expertId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages?.length, chatLoading]);

  // Quick mic queries suggestions
  const voiceSuggestions = [
    "What is the current stock price of NVIDIA?",
    "Optimize this authentication structure",
    "Explain quantum superposition simply"
  ];

  const triggerVoiceSuggestion = (query: string) => {
    setVoiceQueryText(`"${query}"`);
    setTimeout(() => {
      setShowVoiceOverlay(false);
      setInputText(query);
      handleSendDirectly(query);
    }, 1500);
  };

  const handleSendDirectly = async (textToSend: string) => {
    if ((!textToSend.trim() && !attachedImage) || !activeSession) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend || "Analyzing attached photo",
      image: attachedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...activeSession.messages, userMsg];
    onUpdateMessages(updatedMessages);
    setInputText("");
    
    const imageToSend = attachedImage;
    setAttachedImage(null);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          image: imageToSend,
          history: activeSession.messages,
          systemPrompt: currentExpert.systemPrompt
        })
      });

      const data = await response.json();
      if (response.ok) {
        const modelMsg: Message = {
          role: 'model',
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        onUpdateMessages([...updatedMessages, modelMsg]);
        if (onGainXp) {
          onGainXp(30);
        }
      } else {
        throw new Error(data.error || "Failed to query Gemini API");
      }
    } catch (err: any) {
      const errorMsg: Message = {
        role: 'model',
        content: `Error: ${err.message}. Please verify your GEMINI_API_KEY in the Secrets panel.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onUpdateMessages([...updatedMessages, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const onUpdateMessages = (messages: Message[]) => {
    if (activeSession) {
      onUpdateSessionMessages(activeSession.id, messages);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendDirectly(inputText);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-16">
      {/* Welcome Header */}
      <section className="mt-2">
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-1 font-bold">Status: Operational</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">What should we build today?</h2>
      </section>

      {/* AI Experts Bento Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-base font-bold text-white">Specialized Experts</h3>
          <span className="text-[#d0bcff] text-xs font-semibold cursor-pointer hover:underline">View All</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Active Expert Detail */}
          <div className="col-span-2 glass-card p-5 rounded-[24px] flex flex-col gap-4 border border-[#d0bcff]/30 bg-[#d0bcff]/5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-[#d0bcff]/10 text-[#d0bcff] border border-[#d0bcff]/20">
                <Terminal className="w-8 h-8" />
              </div>
              <span className="bg-[#d0bcff]/20 text-[#d0bcff] px-3 py-1 rounded-full text-xs font-bold tracking-wide">Active</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">{currentExpert.name}</h4>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">{currentExpert.description}</p>
              <p className="text-gray-500 text-[11px] mt-2 font-mono">{currentExpert.longDescription}</p>
            </div>
          </div>

          {/* Mini Expert Toggles */}
          {experts.map(exp => (
            <button
              key={exp.id}
              onClick={() => {
                setSelectedExpertId(exp.id);
                onNewSession(exp.id);
              }}
              className={`p-4 rounded-[20px] flex items-center justify-start gap-3 border text-left cursor-pointer transition-all ${
                selectedExpertId === exp.id 
                  ? "border-[#d0bcff]/30 bg-white/5 shadow-lg shadow-[#d0bcff]/5" 
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                {exp.icon === "terminal" && <Terminal className="w-4 h-4 text-indigo-400" />}
                {exp.icon === "school" && <BookOpen className="w-4 h-4 text-cyan-400" />}
                {exp.icon === "payments" && <DollarSign className="w-4 h-4 text-pink-400" />}
                {exp.icon === "palette" && <Palette className="w-4 h-4 text-purple-400" />}
                {exp.icon === "science" && <FlaskConical className="w-4 h-4 text-rose-400" />}
              </div>
              <span className="text-xs font-semibold text-white truncate">{exp.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Knowledge Base */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-white">Knowledge Base</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth no-scrollbar">
          <div className="min-w-[180px] glass-card rounded-[20px] p-4 flex flex-col gap-3 border border-white/5 hover:border-white/10 transition-all">
            <span className="material-symbols-outlined text-gray-400 text-2xl">description</span>
            <div>
              <p className="font-semibold text-white text-xs">Uploaded Docs</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">12 Files • 4.2MB</p>
            </div>
          </div>
          <div className="min-w-[180px] glass-card rounded-[20px] p-4 flex flex-col gap-3 border border-white/5 hover:border-white/10 transition-all">
            <span className="material-symbols-outlined text-gray-400 text-2xl">public</span>
            <div>
              <p className="font-semibold text-white text-xs">Web Sources</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">8 Links Synced</p>
            </div>
          </div>
          <div className="min-w-[180px] glass-card rounded-[20px] p-4 flex flex-col gap-3 border border-white/5 hover:border-white/10 transition-all">
            <span className="material-symbols-outlined text-gray-400 text-2xl">smart_display</span>
            <div>
              <p className="font-semibold text-white text-xs">YouTube Intel</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">3 Transcripts</p>
            </div>
          </div>
        </div>
      </section>

      {/* MCP Connections */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-white">MCP Connections</h3>
        <div className="glass-card rounded-[24px] p-4 xs:p-5 grid grid-cols-2 xs:grid-cols-4 gap-3 xs:gap-4 border border-white/5 bg-white/[0.01]">
          <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-white text-xl">data_object</span>
            </div>
            <span className="text-[9px] uppercase font-mono font-bold tracking-tight text-gray-500">GitHub</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-white text-xl">forum</span>
            </div>
            <span className="text-[9px] uppercase font-mono font-bold tracking-tight text-gray-500">Slack</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#a078ff]/10 flex items-center justify-center border border-[#a078ff]/20">
              <span className="material-symbols-outlined text-[#a078ff] text-xl">auto_fix_high</span>
            </div>
            <span className="text-[9px] uppercase font-mono font-bold tracking-tight text-[#a078ff]">Figma</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 border-dashed">
              <span className="material-symbols-outlined text-gray-500 text-xl">add</span>
            </div>
            <span className="text-[9px] uppercase font-mono font-bold tracking-tight text-gray-500">Connect</span>
          </div>
        </div>
      </section>

      {/* Interactive Chat Output Thread */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-white">Recent Interaction</h3>
        <div className="space-y-4 min-h-[120px] bg-black/20 rounded-3xl p-5 border border-white/5">
          {activeSession && activeSession.messages.length > 0 ? (
            activeSession.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm shadow-md leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-medium rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none font-sans'
                  }`}
                >
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Uploaded visual asset" 
                      className="w-full max-w-[240px] rounded-xl object-cover mb-2 border border-white/10 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`block text-[9px] text-right mt-1.5 ${msg.role === 'user' ? 'text-slate-800' : 'text-gray-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-gray-500 font-mono">
              Begin your conversation with {currentExpert.name}. Type below!
            </div>
          )}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 text-gray-400 text-xs font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#d0bcff] animate-spin" />
                Thinking translucent thoughts...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
      </section>

      {/* Floating Chat Input Dock */}
      <div className="fixed bottom-24 left-0 right-0 z-40 px-4">
        {/* Attachment Preview Box */}
        {attachedImage && (
          <div className="max-w-md mx-auto mb-2 p-2 bg-[#1c1b1b]/95 border border-[#d0bcff]/30 rounded-2xl flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-fade-in">
            <div className="flex items-center gap-2 overflow-hidden">
              <img src={attachedImage} alt="Attached preview" className="w-12 h-12 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
              <div>
                <p className="text-xs font-bold text-white">Photo attachment ready</p>
                <p className="text-[10px] text-gray-500 font-mono">Will be processed by {currentExpert.name}</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setAttachedImage(null)}
              className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-md mx-auto glass-card rounded-full p-2 flex items-center gap-2 border border-white/10 shadow-[0_-10px_35px_rgba(0,0,0,0.6)] bg-[#1c1b1b]/80 backdrop-blur-2xl">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            type="button"
            onClick={triggerImageUpload}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#d0bcff] hover:bg-white/5 transition-all"
            title="Attach visual notes"
          >
            <Image className="w-5 h-5" />
          </button>
          
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${currentExpert.name}...`}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 text-white placeholder-gray-600 focus:outline-none"
          />

          <button 
            type="button"
            onClick={startVoiceRecording}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#4cd7f6] hover:bg-white/5 transition-all"
            title="Use speech mic input"
          >
            <Mic className="w-5 h-5" />
          </button>

          <button 
            type="submit"
            disabled={(!inputText.trim() && !attachedImage) || chatLoading}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(208,188,255,0.4)] active:scale-90 transition-transform cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Animated Voice Overlay (Mic trigger) */}
      <AnimatePresence>
        {showVoiceOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#131313]/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-8"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full bg-[#d0bcff]/20 ${isRecording ? 'animate-ping' : ''}`}></div>
              <div className={`absolute inset-4 rounded-full bg-[#4cd7f6]/20 ${isRecording ? 'animate-pulse' : ''}`}></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] shadow-2xl flex items-center justify-center">
                <Mic className="w-8 h-8 text-slate-950" />
              </div>
            </div>

            <div className="text-center space-y-4 max-w-sm px-6">
              <h2 className="text-2xl font-bold font-sans text-white">Voice Dictation</h2>
              <p className="text-gray-300 font-sans text-sm leading-relaxed p-4 bg-white/5 border border-white/10 rounded-2xl min-h-[80px] max-h-40 overflow-y-auto italic">
                {voiceQueryText}
              </p>
              
              <div className="flex gap-3 justify-center pt-2">
                <button 
                  onClick={() => {
                    setInputText(voiceQueryText);
                    setShowVoiceOverlay(false);
                    stopVoiceRecording();
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Use Transcript
                </button>
                <button 
                  onClick={() => {
                    handleSendDirectly(voiceQueryText);
                    setShowVoiceOverlay(false);
                    stopVoiceRecording();
                  }}
                  className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Send Immediately
                </button>
              </div>

              {/* Voice suggests links */}
              <div className="pt-6 space-y-2">
                <p className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Or select a pre-set query:</p>
                {voiceSuggestions.map((sug, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      stopVoiceRecording();
                      triggerVoiceSuggestion(sug);
                    }}
                    className="block w-full py-2 px-4 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-xs text-gray-300 font-medium transition-all cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setShowVoiceOverlay(false);
                stopVoiceRecording();
              }}
              className="mt-4 px-8 py-2 bg-white/5 border border-white/10 rounded-full font-semibold text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-xs"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
