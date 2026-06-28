/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Chrome, Github, Lock, Mail, Terminal, LogIn, UserPlus, AlertCircle, ExternalLink, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserProfile } from "../types";

interface CustomErrorDetails {
  code: string;
  message: string;
  steps?: string[];
  link?: string;
  linkText?: string;
}

const getErrorDetails = (err: any): CustomErrorDetails => {
  const code = err?.code || "";
  const msg = err?.message || "";
  
  if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
    return {
      code: "auth/operation-not-allowed",
      message: "Authentication Provider is Disabled",
      steps: [
        "This sign-in provider (Email/Password, Google, or GitHub) is currently disabled in your Firebase project console.",
        "To enable it, click the link below to open your Firebase Authentication settings.",
        "Click on 'Add new provider' (or edit an existing one), toggle the 'Enable' switch, and click 'Save'.",
        "Reload this applet preview and try again!"
      ],
      link: "https://console.firebase.google.com/project/knowledgeos-enterpriseai/authentication/providers",
      linkText: "Enable Sign-in Provider in Firebase Console"
    };
  }

  if (code === "auth/popup-closed-by-user" || msg.includes("popup-closed-by-user")) {
    return {
      code: "auth/popup-closed-by-user",
      message: "Login Popup Blocked or Closed",
      steps: [
        "You closed the authentication popup window, or your browser blocked it.",
        "Standard web browsers routinely block popup windows inside sandboxed iframes.",
        "Recommended Fix: Use the standard Email & Password registration form above! It is fully iframe-safe and doesn't require popups."
      ]
    };
  }

  if (code === "auth/email-already-in-use" || msg.includes("email-already-in-use")) {
    return {
      code: "auth/email-already-in-use",
      message: "Email Address Already in Use",
      steps: [
        "An account is already registered under this email address.",
        "Click 'Sign In' at the bottom of the card to log in to your existing account."
      ]
    };
  }

  if (code === "auth/invalid-credential" || msg.includes("invalid-credential") || code === "auth/wrong-password" || msg.includes("wrong-password") || code === "auth/user-not-found" || msg.includes("user-not-found")) {
    return {
      code: "auth/invalid-credential",
      message: "Invalid Login Credentials",
      steps: [
        "The email address or password you entered is incorrect.",
        "Please check your spelling and try again, or register as a new user."
      ]
    };
  }

  if (code === "auth/weak-password" || msg.includes("weak-password")) {
    return {
      code: "auth/weak-password",
      message: "Password is Too Weak",
      steps: [
        "Firebase requires passwords to be at least 6 characters long for security.",
        "Please enter a stronger password of 6 or more characters."
      ]
    };
  }

  return {
    code: "auth/unknown",
    message: typeof err === "string" ? err : (err?.message || "An unexpected error occurred during authentication.")
  };
};

interface AuthPageProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onBack: () => void;
}

export default function AuthPage({ onLoginSuccess, onBack }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(true); // Default to sign up first
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDirectDatabaseAuth = async (isSignUpFlow: boolean) => {
    // Generate a unique document ID based on lowercase email to prevent case issues
    const docId = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const userDocRef = doc(db, "app_users", docId);
    
    if (isSignUpFlow) {
      // Sign Up flow
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        throw {
          code: "auth/email-already-in-use",
          message: "This email is already in use in the database. Please Sign In."
        };
      }
      
      const initialProfile: UserProfile = {
        name: name,
        email: email,
        level: 1,
        xp: 250,
        xpMax: 1000,
        streak: 1
      };
      
      const dbPayload = {
        ...initialProfile,
        password: password // Plain password for simple demo authentication
      };
      
      await setDoc(userDocRef, dbPayload);
      
      // Save to local storage for persistence
      localStorage.setItem("omnimind_db_user_id", docId);
      onLoginSuccess(initialProfile);
    } else {
      // Sign In flow
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        throw {
          code: "auth/user-not-found",
          message: "No user found with this email in the database. Please Sign Up first."
        };
      }
      
      const dbUser = userDocSnap.data() as any;
      if (dbUser.password !== password) {
        throw {
          code: "auth/invalid-credential",
          message: "Invalid password for the registered database user."
        };
      }
      
      // Save to local storage for persistence
      localStorage.setItem("omnimind_db_user_id", docId);
      
      // Convert to clean UserProfile
      const profile: UserProfile = {
        name: dbUser.name,
        email: dbUser.email,
        level: dbUser.level || 1,
        xp: dbUser.xp || 250,
        xpMax: dbUser.xpMax || 1000,
        streak: dbUser.streak || 1
      };
      onLoginSuccess(profile);
    }
  };

  const handleGuestBypass = () => {
    const guestProfile: UserProfile = {
      name: name || "Scholar Guest",
      email: email || "guest@omnimind.ai",
      level: 1,
      xp: 250,
      xpMax: 1000,
      streak: 1
    };
    onLoginSuccess(guestProfile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError({ code: "validation/email-required", message: "Please fill in your email address." });
      return;
    }
    if (!password) {
      setError({ code: "validation/password-required", message: "Please enter your password." });
      return;
    }
    if (isSignUp && !name) {
      setError({ code: "validation/name-required", message: "Please fill in your full name." });
      return;
    }
    if (password.length < 6) {
      setError({ code: "auth/weak-password", message: "Password must be at least 6 characters long." });
      return;
    }

    setLoading(true);
    try {
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
      } catch (fbErr: any) {
        console.warn("Standard Firebase Auth failed/disabled, falling back to direct database-backed auth:", fbErr);
        // Fallback automatically to direct Firestore authentication for operation-not-allowed or other tenant errors
        if (fbErr.code === "auth/operation-not-allowed" || fbErr.message?.includes("operation-not-allowed") || fbErr.code === "auth/unsupported-tenant") {
          await handleDirectDatabaseAuth(isSignUp);
        } else {
          throw fbErr;
        }
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
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
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError(null);
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
      setError(err);
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

            {error && (() => {
              const details = getErrorDetails(error);
              return (
                <div id="auth-error-guide-panel" className="p-4 bg-red-950/25 border border-red-500/20 rounded-2xl space-y-3 text-xs text-left">
                  <div className="flex items-start gap-2 text-red-400 font-bold leading-tight">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />
                    <span>{details.message}</span>
                  </div>
                  {details.steps && (
                    <ul className="list-decimal pl-4.5 space-y-1 text-gray-400 leading-normal">
                      {details.steps.map((step, idx) => (
                        <li key={idx} className="text-[11px]">{step}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {details.link && (
                      <a 
                        id="lnk-error-guide-cta"
                        href={details.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-95 text-[11px] cursor-pointer"
                      >
                        <span>{details.linkText}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleGuestBypass}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-xl font-bold transition-all text-[11px] cursor-pointer"
                    >
                      <span>Skip Setup: Launch Demo Guest Mode</span>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })()}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold hover:shadow-[0_0_20px_rgba(208,188,255,0.3)] active:scale-98 transition-all duration-200 mt-2 flex items-center justify-center text-sm cursor-pointer"
              id="auth-submit-btn"
            >
              {loading ? "Initializing..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>

            <button 
              type="button"
              onClick={handleGuestBypass}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 active:scale-98 transition-all mt-2.5 flex items-center justify-center gap-2 text-sm cursor-pointer"
              id="auth-guest-bypass-btn"
            >
              <span>Continue as Guest (No Setup Required)</span>
              <HelpCircle className="w-4 h-4 text-gray-400" />
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
