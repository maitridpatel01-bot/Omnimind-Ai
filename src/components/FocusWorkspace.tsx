/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer as TimerIcon, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Coffee, 
  Compass, 
  CheckCircle,
  Clock,
  Target,
  Flame
} from "lucide-react";

interface FocusWorkspaceProps {
  onGainXp: (amount: number) => void;
}

export default function FocusWorkspace({ onGainXp }: FocusWorkspaceProps) {
  // Timer configurations
  const [mode, setMode] = useState<"focus" | "short" | "long">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState("Quantum Computing Architectures");
  const [sessionCount, setSessionCount] = useState(0);
  const [customMinutes, setCustomMinutes] = useState("25");

  // Web Audio Synth configurations
  const [synthPlaying, setSynthPlaying] = useState(false);
  const [synthVolume, setSynthVolume] = useState(0.3);
  const [noiseType, setNoiseType] = useState<"brown" | "pink" | "binaural">("brown");

  // Web Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);

  // Timer tick effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleSessionComplete();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  // Handle changes in mode
  const switchMode = (newMode: "focus" | "short" | "long") => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "focus") setTimeLeft(25 * 60);
    else if (newMode === "short") setTimeLeft(5 * 60);
    else if (newMode === "long") setTimeLeft(15 * 60);
  };

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0 && mins <= 180) {
      setIsRunning(false);
      setTimeLeft(mins * 60);
    }
  };

  const handleSessionComplete = () => {
    setSessionCount(prev => prev + 1);
    // Award 50 XP
    onGainXp(50);
    
    // Play sound notification
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.30); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45); // C6
      
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }

    // Reset back to break or focus mode
    if (mode === "focus") {
      switchMode("short");
    } else {
      switchMode("focus");
    }
  };

  // Web Audio Ambient Synthesizer Implementation
  const startSynth = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create Gain Node
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.gain.setValueAtTime(synthVolume, ctx.currentTime);
      gainNodeRef.current.connect(ctx.destination);

      if (noiseType === "brown" || noiseType === "pink") {
        // Synthesizing pure brownian/pink noise mathematically
        const bufferSize = 4096 * 4;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let lastOut = 0.0;
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (noiseType === "brown") {
            // Brownian Noise Filter
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Gain compensation
          } else {
            // Pink Noise Filter (Paul Kellet's refined method)
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            b6 = white * 0.115926;
            output[i] *= 0.11; // Gain compensation
          }
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;
        noiseNode.connect(gainNodeRef.current);
        noiseNode.start();
        noiseNodeRef.current = noiseNode;

      } else if (noiseType === "binaural") {
        // Binaural Beats - Alpha waves (10Hz difference for meditation focus)
        // Left Ear: 200Hz, Right Ear: 210Hz
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        
        const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(200, ctx.currentTime);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(210, ctx.currentTime);

        if (panner1 && panner2) {
          panner1.pan.setValueAtTime(-1, ctx.currentTime); // Hard left
          panner2.pan.setValueAtTime(1, ctx.currentTime);  // Hard right
          
          osc1.connect(panner1);
          panner1.connect(gainNodeRef.current);
          
          osc2.connect(panner2);
          panner2.connect(gainNodeRef.current);
        } else {
          osc1.connect(gainNodeRef.current);
          osc2.connect(gainNodeRef.current);
        }

        osc1.start();
        osc2.start();
        
        osc1Ref.current = osc1;
        osc2Ref.current = osc2;
      }

      setSynthPlaying(true);
    } catch (e) {
      console.error("Failed to start synthesizer:", e);
    }
  };

  const stopSynth = () => {
    if (noiseNodeRef.current) {
      try { (noiseNodeRef.current as any).stop(); } catch(e){}
      noiseNodeRef.current = null;
    }
    if (osc1Ref.current) {
      try { osc1Ref.current.stop(); } catch(e){}
      osc1Ref.current = null;
    }
    if (osc2Ref.current) {
      try { osc2Ref.current.stop(); } catch(e){}
      osc2Ref.current = null;
    }
    setSynthPlaying(false);
  };

  useEffect(() => {
    // Dynamically adjust synthesizer volume when node slider moves
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(synthVolume, audioCtxRef.current.currentTime);
    }
  }, [synthVolume]);

  useEffect(() => {
    // If noise type changes while playing, restart to load correct node tree
    if (synthPlaying) {
      stopSynth();
      setTimeout(() => startSynth(), 50);
    }
  }, [noiseType]);

  // Clean up audio references on unmount
  useEffect(() => {
    return () => {
      stopSynth();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(err => console.log(err));
      }
    };
  }, []);

  const toggleSynth = () => {
    if (synthPlaying) stopSynth();
    else startSynth();
  };

  // Helper formatting minutes
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = timeLeft / (mode === "focus" ? 25 * 60 : mode === "short" ? 5 * 60 : 15 * 60) * 100;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-16">
      {/* Title Header */}
      <section className="mt-2">
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-1 font-bold">Workspace: Alpha Brain</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">Focus & Synthesize</h2>
      </section>

      {/* Main Focus Center */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Core Timer Module */}
        <div className="md:col-span-7 glass-card rounded-[32px] border border-white/5 bg-[#07070b]/60 p-6 flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

          {/* Mode Selectors */}
          <div className="flex gap-1.5 bg-white/5 border border-white/5 p-1 rounded-2xl mb-8 z-10">
            <button
              onClick={() => switchMode("focus")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "focus" 
                  ? "bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 shadow-md" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Focus Mode
            </button>
            <button
              onClick={() => switchMode("short")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "short" 
                  ? "bg-white/10 text-[#4cd7f6]" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => switchMode("long")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "long" 
                  ? "bg-white/10 text-[#d0bcff]" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Long Break
            </button>
          </div>

          {/* Clock Display Circle */}
          <div className="relative w-56 h-56 flex items-center justify-center mb-8">
            {/* Background SVG Track */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="102"
                className="stroke-white/[0.03] fill-transparent"
                strokeWidth="6"
              />
              <motion.circle
                cx="112"
                cy="112"
                r="102"
                className={`fill-transparent ${
                  mode === "focus" 
                    ? "stroke-[#d0bcff]" 
                    : mode === "short" 
                      ? "stroke-[#4cd7f6]" 
                      : "stroke-[#f751a1]"
                }`}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 102}
                animate={{ strokeDashoffset: (2 * Math.PI * 102) * (1 - progressPercentage / 100) }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                strokeLinecap="round"
              />
            </svg>

            {/* Glowing countdown numerals */}
            <div className="text-center z-10 flex flex-col items-center">
              <motion.span 
                key={timeLeft}
                initial={{ opacity: 0.9, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-4xl font-extrabold text-white font-sans tracking-tight block drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]"
              >
                {formatTime(timeLeft)}
              </motion.span>
              <span className="text-[10px] font-mono font-extrabold uppercase text-gray-500 tracking-widest mt-1">
                {isRunning ? "COGNITIVE LOCK" : "STANDBY FLOW"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 z-10 items-center justify-center">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                isRunning 
                  ? "bg-white/10 text-white border border-white/10 hover:bg-white/15" 
                  : "bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] text-slate-950 shadow-[0_0_15px_rgba(208,188,255,0.3)] hover:scale-105"
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                switchMode(mode);
              }}
              title="Reset timer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-90"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Custom Time Setter */}
          <form onSubmit={handleCustomTimeSubmit} className="mt-8 flex gap-2 items-center bg-white/3 border border-white/5 rounded-xl px-2.5 py-1">
            <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider pl-1">Set Custom:</span>
            <input 
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="w-10 bg-transparent text-center text-xs text-white border-none focus:outline-none focus:ring-0 p-1 font-mono font-bold"
              min="1"
              max="180"
            />
            <span className="text-[9px] font-mono text-gray-500 uppercase">min</span>
            <button 
              type="submit" 
              className="px-2 py-1 bg-white/10 rounded-lg text-[9px] font-extrabold text-[#4cd7f6] uppercase border border-[#4cd7f6]/10"
            >
              Sync
            </button>
          </form>

        </div>

        {/* Web Audio Synthesizer Controls */}
        <div className="md:col-span-5 flex flex-col gap-4">
          
          {/* Ambient Noise Generator Capsule */}
          <div className="glass-card rounded-3xl border border-white/5 bg-[#07070b]/60 p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#4cd7f6]" />
                <span className="text-xs font-bold text-white uppercase tracking-tight">Ambient Noise Synth</span>
              </div>
              <button
                onClick={toggleSynth}
                className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  synthPlaying 
                    ? "bg-[#4cd7f6]/15 text-[#4cd7f6] border-[#4cd7f6]/30 animate-pulse" 
                    : "bg-white/5 text-gray-500 border-white/5 hover:text-white"
                }`}
              >
                {synthPlaying ? "Synth Active" : "Play Synth"}
              </button>
            </div>

            {/* Noise Preset Options */}
            <div className="grid grid-cols-3 gap-2 mt-1">
              <button
                onClick={() => setNoiseType("brown")}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  noiseType === "brown" 
                    ? "bg-[#d0bcff]/10 text-[#d0bcff] border-[#d0bcff]/30" 
                    : "bg-white/[0.02] text-gray-500 border-white/5 hover:text-gray-300"
                }`}
              >
                Brown Noise
              </button>
              <button
                onClick={() => setNoiseType("pink")}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  noiseType === "pink" 
                    ? "bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/30" 
                    : "bg-white/[0.02] text-gray-500 border-white/5 hover:text-gray-300"
                }`}
              >
                Pink Noise
              </button>
              <button
                onClick={() => setNoiseType("binaural")}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  noiseType === "binaural" 
                    ? "bg-[#ffd9e4]/10 text-[#ffd9e4] border-[#ffd9e4]/30" 
                    : "bg-white/[0.02] text-gray-500 border-white/5 hover:text-gray-300"
                }`}
              >
                Alpha Beats
              </button>
            </div>

            {/* Slider Control */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                <span>Decibel Output</span>
                <span>{Math.round(synthVolume * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <VolumeX className="w-3.5 h-3.5 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={synthVolume}
                  onChange={(e) => setSynthVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4cd7f6]"
                />
                <Volume2 className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
            
            <p className="text-[10px] text-gray-500 leading-normal font-sans pt-1">
              *Synthesized purely on-device via Web Audio. Deep soundscapes isolate environmental noise, maximizing neuro-coherence.
            </p>
          </div>

          {/* Goal Selector Capsule */}
          <div className="glass-card rounded-3xl border border-white/5 bg-[#07070b]/60 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-[#d0bcff]" />
              <span className="text-xs font-bold text-white uppercase tracking-tight">Active Target Goal</span>
            </div>
            <input
              type="text"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              placeholder="What are you focusing on?"
              className="w-full bg-black/40 border border-white/5 focus:border-[#d0bcff]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            
            {/* Quick Suggestions */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-extrabold mt-1">Suggested Targets:</span>
              <button
                onClick={() => setSelectedGoal("Optimize low-latency TSMC compile code")}
                className="text-left text-[10px] text-gray-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg border border-transparent hover:border-white/5 truncate font-medium"
              >
                TSMC Edge Compiler Latency Optimization
              </button>
              <button
                onClick={() => setSelectedGoal("Draft quantum neural ansatz formulas")}
                className="text-left text-[10px] text-gray-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg border border-transparent hover:border-white/5 truncate font-medium"
              >
                Quantum Ansatz Coherence Research
              </button>
            </div>
          </div>

          {/* Productivity Stats Module */}
          <div className="glass-card rounded-3xl border border-white/5 bg-[#07070b]/60 p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase text-gray-500 block leading-none">Completed Sessions</span>
                <span className="text-lg font-extrabold text-white font-sans mt-1 block">{sessionCount} cycles</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-extrabold text-green-400 font-mono block bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md uppercase">
                +{sessionCount * 50} XP Gained
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
