/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, User, Bell, Shield, Volume2, VolumeX, Mail, HelpCircle, MessageSquare, Send, RefreshCw, AlertCircle, Sparkles, Check, HelpCircle as FaqIcon, Search, Settings } from "lucide-react";
import { UserProfile, SupportTicket } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onResetData: () => void;
  onAddNotification: (title: string, desc: string, type: 'xp' | 'level' | 'info' | 'success') => void;
  tickets: SupportTicket[];
  onAddTicket: (subject: string, category: string, desc: string) => void;
  onAddTicketReply: (ticketId: string, content: string) => void;
}

const FAQS = [
  {
    q: "How do I earn XP inside OmniMind?",
    a: "You earn XP automatically by using the workspaces! Creating knowledge mind maps earns +20 XP, AI-expanding ideas earns +40 XP, scoring in quizzes earns up to +35 XP, and compiling functional code earns +25 XP."
  },
  {
    q: "Can I connect my Google accounts safely?",
    a: "Absolutely. OmniMind uses standard OAuth protocols where credentials are kept secure and never stored in cleartext. All server-side tasks utilize server proxy layers."
  },
  {
    q: "What is Startup Studio ATS review?",
    a: "The ATS checker evaluates your pitch material, resume draft, and tech stack options against real-world silicon valley application tracking criteria to spot compliance red-flags before you apply."
  },
  {
    q: "How does the daylight mode work?",
    a: "Daylight mode shifts the workspace to a high-contrast theme featuring generous negative margins and sharp typography, optimizing the screen for outdoor and bright office usage."
  }
];

export default function SettingsModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onResetData,
  onAddNotification,
  tickets,
  onAddTicket,
  onAddTicketReply
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'support'>('settings');
  
  // Profile settings state
  const [tempName, setTempName] = useState(user.name);
  const [tempEmail, setTempEmail] = useState(user.email);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  // FAQ Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // New Ticket State
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Bug Report");
  const [ticketDesc, setTicketDesc] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Active chat state for specific ticket
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: tempName,
      email: tempEmail
    });
    setShowSavedMsg(true);
    onAddNotification(
      "Profile Updated",
      "Your user profile settings and preferences were successfully applied.",
      "success"
    );
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;

    setSubmittingTicket(true);
    setTimeout(() => {
      onAddTicket(ticketSubject, ticketCategory, ticketDesc);
      setTicketSubject("");
      setTicketDesc("");
      setSubmittingTicket(false);
      setTicketSuccess(true);
      onAddNotification(
        "Support Ticket Created",
        "Our support desk received your inquiry. An agent will follow up shortly.",
        "info"
      );
      setTimeout(() => setTicketSuccess(false), 3000);
    }, 800);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;
    onAddTicketReply(selectedTicketId, replyText);
    setReplyText("");
  };

  const filteredFaqs = FAQS.filter(
    faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl h-[600px] rounded-2xl bg-[#0d0d12] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-10 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/2">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#d0bcff]" />
            <h3 className="text-base font-bold text-white">System Settings & Support</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation */}
        <div className="flex border-b border-white/5 bg-black/20 px-6">
          <button
            onClick={() => { setActiveTab('settings'); setSelectedTicketId(null); }}
            className={`px-4 py-3 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? "border-[#d0bcff] text-[#d0bcff]"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            General & Profile
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-3 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'support'
                ? "border-[#d0bcff] text-[#d0bcff]"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Support & Tickets
            {tickets.some(t => t.status === "Open") && (
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'settings' && (
              <motion.div
                key="settings-pane"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Profile Edit Form */}
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#4cd7f6]" />
                    <h4 className="text-xs font-bold font-mono uppercase text-gray-400">Account Profile</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">User Name</label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#d0bcff]/40"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Email Address</label>
                      <input
                        type="email"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#d0bcff]/40"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {showSavedMsg ? (
                      <span className="text-xs font-mono text-green-400 flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Changes saved successfully!
                      </span>
                    ) : <span />}
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-bold text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    >
                      Apply Preferences
                    </button>
                  </div>
                </form>

                <hr className="border-white/5" />

                {/* Preference Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#ffd9e4]" />
                    <h4 className="text-xs font-bold font-mono uppercase text-gray-400">System Audio & Alerts</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-xs font-bold text-white">Earned XP Audio Simulation</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Simulate a high-frequency digital alert when receiving XP rewards.</p>
                      </div>
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          soundEnabled 
                            ? "bg-[#d0bcff]/15 border-[#d0bcff]/30 text-[#d0bcff]" 
                            : "bg-white/5 border-white/10 text-gray-500"
                        }`}
                      >
                        {soundEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-xs font-bold text-white">Desktop Push Notifications</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Show simulated banner alerts in your dashboard container.</p>
                      </div>
                      <button
                        onClick={() => setNotifsEnabled(!notifsEnabled)}
                        className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer ${
                          notifsEnabled ? "bg-[#4cd7f6]" : "bg-white/10"
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full bg-slate-950 transition-transform ${notifsEnabled ? "translate-x-5.5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Danger Zone */}
                <div className="space-y-4 p-4.5 rounded-2xl border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <h4 className="text-xs font-bold font-mono uppercase text-red-400">Database & History Reset</h4>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    This action will reset your XP progress to base levels, clear all custom workspace session files, remove notes and restore the application to fresh onboarding parameters. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you absolutely sure you want to reset all data and clear your XP score?")) {
                        onResetData();
                        onClose();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Clear Workspace History
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'support' && (
              <motion.div
                key="support-pane"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {!selectedTicketId ? (
                  <>
                    {/* FAQ & Quick Search */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FaqIcon className="w-4 h-4 text-[#ffd9e4]" />
                        <h4 className="text-xs font-bold font-mono uppercase text-gray-400">Knowledge FAQs</h4>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search questions (e.g. XP, Startup, ATS)..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#ffd9e4]/30"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-0.5 no-scrollbar">
                        {filteredFaqs.map((faq, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-1">
                            <p className="text-xs font-bold text-white">{faq.q}</p>
                            <p className="text-[11px] text-gray-400 leading-relaxed">{faq.a}</p>
                          </div>
                        ))}
                        {filteredFaqs.length === 0 && (
                          <p className="text-xs text-gray-500 col-span-2 py-4 text-center">No FAQ results found. Try submitting a support ticket below!</p>
                        )}
                      </div>
                    </div>

                    <hr className="border-white/5" />

                    {/* Submit Support Ticket and Active Tickets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Submit Ticket */}
                      <form onSubmit={handleCreateTicketSubmit} className="md:col-span-7 space-y-3 bg-white/2 border border-white/5 p-4.5 rounded-2xl">
                        <h4 className="text-xs font-bold font-mono uppercase text-gray-300">Submit a Support Ticket</h4>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2 space-y-0.5">
                            <label className="text-[9px] font-bold font-mono text-gray-500">Subject</label>
                            <input
                              type="text"
                              value={ticketSubject}
                              onChange={(e) => setTicketSubject(e.target.value)}
                              placeholder="Describe your issue"
                              required
                              className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/10 text-xs text-white"
                            />
                          </div>
                          
                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold font-mono text-gray-500">Category</label>
                            <select
                              value={ticketCategory}
                              onChange={(e) => setTicketCategory(e.target.value)}
                              className="w-full px-2.5 py-2 rounded-lg bg-[#07070b] border border-white/10 text-xs text-white"
                            >
                              <option>Bug Report</option>
                              <option>Feature Request</option>
                              <option>Account Issue</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold font-mono text-gray-500">Detailed Description</label>
                          <textarea
                            value={ticketDesc}
                            onChange={(e) => setTicketDesc(e.target.value)}
                            placeholder="Provide steps to reproduce or details of request..."
                            required
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          {ticketSuccess ? (
                            <span className="text-[11px] text-green-400 font-mono flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Ticket created!
                            </span>
                          ) : <span />}
                          <button
                            type="submit"
                            disabled={submittingTicket}
                            className="px-4 py-2 rounded-lg bg-[#d0bcff] hover:opacity-90 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {submittingTicket ? "Submitting..." : "Send Ticket"}
                          </button>
                        </div>
                      </form>

                      {/* Ticket History */}
                      <div className="md:col-span-5 space-y-3">
                        <h4 className="text-xs font-bold font-mono uppercase text-gray-400">Support Inbox</h4>
                        
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5 no-scrollbar">
                          {tickets.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl">
                              <p className="text-xs text-gray-400">No support tickets</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">Your open inquiries appear here.</p>
                            </div>
                          ) : (
                            tickets.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => setSelectedTicketId(t.id)}
                                className="p-3 rounded-xl border border-white/5 bg-white/3 hover:bg-white/8 transition-colors cursor-pointer text-left"
                              >
                                <div className="flex justify-between items-center">
                                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                    t.status === "Resolved"
                                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                      : t.status === "In Progress"
                                      ? "bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20"
                                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                  }`}>
                                    {t.status}
                                  </span>
                                  <span className="text-[8px] font-mono text-gray-500">{t.createdAt}</span>
                                </div>
                                <p className="text-xs font-bold text-white mt-1.5 truncate">{t.subject}</p>
                                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                                  <span className="text-[10px] font-mono text-[#d0bcff]">{t.category}</span>
                                  <span className="text-[9px] text-[#4cd7f6]">{t.replies.length} replies</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Active Ticket Interaction Chat Pane */
                  selectedTicket && (
                    <div className="flex flex-col h-[400px] border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                      {/* Ticket Header */}
                      <div className="px-4 py-3 bg-white/2 border-b border-white/10 flex justify-between items-center">
                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedTicketId(null)}
                              className="text-xs text-[#d0bcff] hover:underline font-bold"
                            >
                              ← History
                            </button>
                            <span className="text-gray-500">/</span>
                            <span className="text-xs font-bold text-white truncate max-w-xs">{selectedTicket.subject}</span>
                          </div>
                          <p className="text-[9px] font-mono text-gray-500 uppercase">{selectedTicket.category} • Created: {selectedTicket.createdAt}</p>
                        </div>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          selectedTicket.status === "Resolved" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                        }`}>
                          {selectedTicket.status}
                        </span>
                      </div>

                      {/* Ticket Message Thread */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-2 scrollbar-thin">
                        {/* Original ticket desc */}
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-left">
                          <p className="text-[10px] font-mono font-bold text-[#d0bcff]">Inquiry Description:</p>
                          <p className="text-xs text-white leading-relaxed">{selectedTicket.description}</p>
                        </div>

                        {selectedTicket.replies.map((reply, i) => (
                          <div
                            key={i}
                            className={`flex flex-col max-w-[85%] ${
                              reply.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                            }`}
                          >
                            <div className={`p-3 rounded-2xl text-xs text-left leading-relaxed ${
                              reply.role === 'user'
                                ? "bg-[#d0bcff]/15 border border-[#d0bcff]/20 text-white rounded-tr-none"
                                : "bg-slate-900 border border-white/5 text-gray-100 rounded-tl-none"
                            }`}>
                              <p>{reply.content}</p>
                            </div>
                            <span className="text-[8px] font-mono text-gray-500 mt-1">{reply.timestamp}</span>
                          </div>
                        ))}
                      </div>

                      {/* Reply input */}
                      <form onSubmit={handleSendReply} className="p-3 border-t border-white/10 bg-white/2 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type reply to support agent..."
                          required
                          className="flex-1 px-3 py-2 rounded-xl bg-[#07070b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#d0bcff]/40"
                        />
                        <button
                          type="submit"
                          className="w-9 h-9 rounded-xl bg-[#d0bcff] hover:opacity-90 flex items-center justify-center text-slate-950 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
