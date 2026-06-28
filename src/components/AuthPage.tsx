/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Chrome, Github, Lock, Mail, Terminal, LogIn, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserProfile } from "../types";

interface AuthPageProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onBack: () => void;
}

export default function AuthPage({ onLoginSuccess, onBack }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(true); // Default to sign up first
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please fill in your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (isSignUp && !name) {
      setError("Please fill in your full name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Firebase Auth Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Update profile display name
        await updateProfile(fbUser, { displayName: name });

        // Initialize Firestore User Profile
        const initialProfile: UserProfile = {
          name: name,
          email: email,
          level: 1,
          xp: 250,
          xpMax: 1000,
          streak: 1
        };

        await setDoc(doc(db, "users", fbUser.uid), initialProfile);
        onLoginSuccess(initialProfile);
      } else {
        // Firebase Auth Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Fetch User Profile from Firestore
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let profile: UserProfile;
        if (userDocSnap.exists()) {
          profile = userDocSnap.data() as UserProfile;
        } else {
          // Fallback if no Firestore profile exists
          profile = {
            name: fbUser.displayName || email.split("@")[0],
            email: email,
            level: 1,
            xp: 250,
            xpMax: 1000,
            streak: 1
          };
          await setDoc(userDocRef, profile);
        }

        onLoginSuccess(profile);
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      let friendlyMessage = "Authentication failed. Please verify your details.";
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already in use. Try signing in instead.";
      } else if (err.code === "auth/invalid-credential") {
        friendlyMessage = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Password is too weak. Must be at least 6 characters.";
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const fbUser = userCredential.user;

      const userDocRef = doc(db, "users", fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let profile: UserProfile;
      if (userDocSnap.exists()) {
        profile = userDocSnap.data() as UserProfile;
      } else {
        profile = {
          name: fbUser.displayName || "Google Scholar",
          email: fbUser.email || "",
          level: 1,
          xp: 250,
          xpMax: 1000,
          streak: 1
        };
        await setDoc(userDocRef, profile);
      }

      onLoginSuccess(profile);
    } catch (err: any) {
      console.error("Google Authentication Error:", err);
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const fbUser = userCredential.user;

      const userDocRef = doc(db, "users", fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let profile: UserProfile;
      if (userDocSnap.exists()) {
        profile = userDocSnap.data() as UserProfile;
      } else {
        profile = {
          name: fbUser.displayName || "GitHub Developer",
          email: fbUser.email || "",
          level: 1,
          xp: 250,
          xpMax: 1000,
          streak: 1
        };
        await setDoc(userDocRef, profile);
      }

      onLoginSuccess(profile);
    } catch (err: any) {
      console.error("GitHub Authentication Error:", err);
      setError(err.message || "GitHub Sign-In failed.");
    } finally {
      setLoading(false);
    }
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
              id="btn-google-signin"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <Chrome className="w-4 h-4 text-red-400" />
              Google
            </button>
            <button 
              id="btn-github-signin"
              onClick={handleGithubSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
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
