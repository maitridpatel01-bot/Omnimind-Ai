/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowUpRight, Search, MessageSquare, Code, Brain, ChevronRight, HelpCircle, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onGetStarted: () => void;
  onSelectTab: (tab: string) => void;
}

export default function LandingPage({ onGetStarted, onSelectTab }: LandingPageProps) {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const capabilities = [
    {
      icon: <MessageSquare className="w-8 h-8 text-indigo-400" />,
      title: "Neural Chat",
      desc: "Context-aware conversations that adapt to your unique persona.",
      tab: "chat"
    },
    {
      icon: <Code className="w-8 h-8 text-cyan-400" />,
      title: "OmniCode",
      desc: "Zero-latency coding assistance for complex architectures.",
      tab: "code"
    },
    {
      icon: <Brain className="w-8 h-8 text-pink-400" />,
      title: "AI Research",
      desc: "Synthetic analysis across billions of data points in real-time.",
      tab: "note"
    }
  ];

  const experts = [
    {
      name: "Dr. Aris",
      title: "Master Educator",
      desc: "Specializes in translating quantum physics into digestible concepts.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
      accent: "text-indigo-400"
    },
    {
      name: "Nexus-9",
      title: "Lead Architect",
      desc: "Optimization expert for low-level systems and high-scale deployments.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80",
      accent: "text-cyan-400"
    },
    {
      name: "Sera",
      title: "Bio-Analyst",
      desc: "Diagnosing complex biological patterns with 99.9% inference accuracy.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
      accent: "text-pink-400"
    }
  ];

  const faqs = [
    {
      q: "Is my data encrypted?",
      a: "Yes, all processing occurs with end-to-end TLS encryption, and your custom study notes or code documents are securely compartmentalized."
    },
    {
      q: "Can I export my code?",
      a: "Absolutely. You can export complete structures directly in Python, TypeScript, or raw JSON, or push immediately to your connected GitHub repositories."
    },
    {
      q: "How many languages are supported?",
      a: "OmniMind supports over 45 programming languages and translates conversational research queries across 120 global languages."
    }
  ];

  return (
    <div className="min-h-screen text-gray-200 overflow-x-hidden bg-[#0a0a0f] pb-24 relative" id="landing-page-root">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-pink-500/10 blur-[100px]"></div>
      </div>

      {/* Landing Header */}
      <header className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-3xl border-b border-white/10 shadow-lg">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="font-sans text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6]">
            OmniMind
          </div>
          <button 
            onClick={onGetStarted}
            className="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold transition-all"
            id="landing-signin-btn"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-32 pb-16 flex flex-col items-center text-center max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse"></span>
          <span className="text-xs font-semibold text-[#4cd7f6] uppercase tracking-widest font-mono">v4.0 Live Now</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold font-sans tracking-tight leading-none mb-6 text-white"
        >
          Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0bcff] via-[#4cd7f6] to-[#f751a1]">Translucent</span> Intelligence
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed"
        >
          Unlock the infinite potential of human-AI collaboration with OmniMind's unified ecosystem.
        </motion.p>

        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={onGetStarted}
          className="w-full max-w-xs py-4 rounded-full bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold shadow-[0_0_30px_rgba(208,188,255,0.4)] hover:shadow-[0_0_40px_rgba(208,188,255,0.6)] active:scale-95 transition-all duration-200 text-lg cursor-pointer"
          id="landing-hero-getstarted"
        >
          Get Started
        </motion.button>
      </section>

      {/* Capabilities Section */}
      <section className="px-6 max-w-5xl mx-auto mb-20 relative z-10">
        <h2 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-6">Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <div 
              key={i}
              onClick={() => {
                onGetStarted(); // Go to Signin or select Tab
              }}
              className="glass-card p-6 min-h-[180px] flex flex-col justify-between group cursor-pointer border border-white/5 hover:border-[#d0bcff]/30 hover:bg-white/5 rounded-3xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                {cap.icon}
                <ArrowUpRight className="text-gray-500 group-hover:text-[#d0bcff] transition-colors" />
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold font-sans text-white mb-2">{cap.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Demo Mockup */}
      <section className="px-6 max-w-4xl mx-auto mb-24 relative z-10">
        <div className="glass-card relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-3xl rounded-3xl shadow-2xl">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
            <span className="ml-4 text-[10px] font-mono text-gray-500">omnidrive://nexus_node_01</span>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-4">
              <div className="self-start bg-white/5 border border-white/10 px-5 py-3 rounded-2xl rounded-tl-none text-sm max-w-[85%] text-gray-300 leading-relaxed">
                How can I optimize this React component for edge delivery?
              </div>
              <div className="self-end bg-[#d0bcff]/10 border border-[#d0bcff]/20 px-5 py-3 rounded-2xl rounded-tr-none text-sm max-w-[85%] text-[#d0bcff] leading-relaxed">
                Analyzing dependency tree... <br />
                <span className="font-mono text-cyan-400 mt-1 block">Result: 42% latency reduction detected.</span>
              </div>
            </div>

            {/* Simulated graph visualization */}
            <div className="mt-8 h-32 w-full rounded-2xl overflow-hidden relative border border-white/5 bg-black/30">
              <div className="absolute inset-0 bg-gradient-to-t from-[#d0bcff]/10 to-transparent"></div>
              <div className="flex items-end justify-around h-full px-6 pb-4">
                <div className="w-6 md:w-8 bg-indigo-500/40 rounded-t h-1/2 animate-pulse"></div>
                <div className="w-6 md:w-8 bg-[#4cd7f6] rounded-t h-3/4 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-6 md:w-8 bg-indigo-500/20 rounded-t h-1/4 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                <div className="w-6 md:w-8 bg-[#f751a1]/40 rounded-t h-2/3 animate-pulse" style={{ animationDelay: "0.1s" }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Experts Horizontal Scroll */}
      <section className="px-6 max-w-5xl mx-auto mb-24 relative z-10">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">Specialized Minds</h2>
            <h3 className="text-2xl font-bold font-sans text-white">Meet the Experts</h3>
          </div>
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#d0bcff]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 scroll-smooth">
          {experts.map((exp, i) => (
            <div key={i} className="flex-shrink-0 w-72 glass-card p-6 border border-white/5 rounded-3xl hover:border-white/10 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-6 border border-white/10">
                <img className="w-full h-full object-cover" src={exp.avatar} alt={exp.name} />
              </div>
              <h4 className="text-xl font-bold text-white mb-1 font-sans">{exp.name}</h4>
              <p className={`${exp.accent} text-sm font-semibold mb-4`}>{exp.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{exp.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section / Ecosystem Access */}
      <section className="px-6 max-w-4xl mx-auto mb-24 relative z-10">
        <h2 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest text-center mb-8">Ecosystem Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="glass-card p-8 border border-white/10 rounded-3xl flex flex-col justify-between hover:bg-white/5 transition-all">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-white">Standard</h4>
                  <p className="text-gray-400 text-sm mt-1">Essential intelligence</p>
                </div>
                <div className="text-3xl font-bold text-white">Free</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <Check className="w-5 h-5 text-[#d0bcff]" />
                  100 daily neural prompts
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <Check className="w-5 h-5 text-[#d0bcff]" />
                  Community chat access
                </li>
              </ul>
            </div>
            <button 
              onClick={onGetStarted}
              className="w-full py-3 rounded-2xl border border-white/20 hover:bg-white/5 font-semibold text-sm transition-all"
            >
              Choose Standard
            </button>
          </div>

          {/* Pro Tier */}
          <div className="glass-card p-8 border-[#d0bcff]/40 bg-[#d0bcff]/5 rounded-3xl relative overflow-hidden flex flex-col justify-between scale-100 md:scale-105 shadow-[0_0_50px_rgba(208,188,255,0.15)]">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#d0bcff] text-slate-950 text-[10px] font-bold uppercase tracking-widest rounded-bl-2xl">
              Most Popular
            </div>
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-white">Pro Member</h4>
                  <p className="text-[#d0bcff] text-sm font-semibold mt-1">Unrestricted power</p>
                </div>
                <div className="text-3xl font-bold text-white">
                  $24<span className="text-xs text-gray-400 font-normal">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-100">
                  <Check className="w-5 h-5 text-[#d0bcff]" />
                  Unlimited neural prompts
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-100">
                  <Check className="w-5 h-5 text-[#d0bcff]" />
                  All Expert AI models
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-100">
                  <Check className="w-5 h-5 text-[#d0bcff]" />
                  Priority inference lanes
                </li>
              </ul>
            </div>
            <button 
              onClick={onGetStarted}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold shadow-lg shadow-[#d0bcff]/20 active:scale-95 transition-all text-sm"
            >
              Get Pro Now
            </button>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-6 max-w-3xl mx-auto mb-20 relative z-10">
        <h2 className="text-2xl font-bold font-sans text-white text-center mb-10">Frequently Asked</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="glass-card rounded-2xl border border-white/5 overflow-hidden cursor-pointer"
              onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
            >
              <div className="p-5 flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                <span className="font-semibold text-gray-200 text-sm md:text-base">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeFAQ === idx ? "rotate-180" : ""}`} />
              </div>
              <AnimatePresence>
                {activeFAQ === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/5 bg-[#131313]/40"
                  >
                    <p className="p-5 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-12 flex flex-col items-center gap-6 relative z-10">
        <div className="font-sans text-2xl font-bold text-white">OmniMind</div>
        <div className="flex gap-8 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
          <a href="#" className="hover:text-white transition-colors">Changelog</a>
        </div>
        <p className="text-xs text-gray-500 font-mono">
          © 2026 OmniMind AI Ecosystem. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
