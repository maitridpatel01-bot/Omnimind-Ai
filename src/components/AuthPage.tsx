/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Chrome, Github, Lock, Mail, Terminal } from "lucide-react";
import { motion } from "motion/react";

interface AuthPageProps {
  onLoginSuccess: (email: string, name: string) => void;
  onBack: () => void;
}

export default function AuthPage({ onLoginSuccess, onBack }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("alex.rivera@omnimind.ai");
  const [name, setName] = useState("Alex Rivera");
  const [password, setPassword] = useState("••••••••");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please fill in your email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Extract name from email if signing up, or use the entered name
      let displayName = name;
      if (!isSignUp && email.includes("@")) {
        const part = email.split("@")[0];
        displayName = part.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }
      onLoginSuccess(email, displayName || "Alex");
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f] text-gray-200 relative overflow-hidden font-sans">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-pink-500/10 blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* App Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 cursor-pointer" onClick={onBack}>
            <Terminal className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">OmniMind</h1>
          <p className="text-gray-400 text-sm mt-1">Intelligent ecosystems for the modern age.</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-3xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">
            {isSignUp ? "Create Your Account" : "Sign In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-[#d0bcff]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all text-white placeholder-gray-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-[#d0bcff]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all text-white placeholder-gray-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-xs text-[#d0bcff] hover:underline font-semibold">Forgot Password?</a>
                )}
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-[#d0bcff]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all text-white placeholder-gray-600"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs py-1 px-2 bg-red-900/20 border border-red-900/40 rounded-lg">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold hover:shadow-[0_0_20px_rgba(208,188,255,0.3)] active:scale-98 transition-all duration-200 mt-2 flex items-center justify-center text-sm cursor-pointer"
              id="auth-submit-btn"
            >
              {loading ? "Initializing..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          {/* Social Sign-in Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">or continue with</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onLoginSuccess("alex.rivera@omnimind.ai", "Alex Rivera")}
              className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all"
            >
              <Chrome className="w-4 h-4 text-red-400" />
              Google
            </button>
            <button 
              onClick={() => onLoginSuccess("alex.rivera@omnimind.ai", "Alex Rivera")}
              className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all"
            >
              <Github className="w-4 h-4 text-white" />
              GitHub
            </button>
          </div>

          {/* Bottom Switch */}
          <div className="mt-6 text-center text-xs text-gray-400">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#d0bcff] hover:underline font-bold ml-1"
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
