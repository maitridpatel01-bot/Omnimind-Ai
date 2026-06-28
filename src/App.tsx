/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import ChatWorkspace from "./components/ChatWorkspace";
import NoteWorkspace from "./components/NoteWorkspace";
import CodeWorkspace from "./components/CodeWorkspace";
import ResearchWorkspace from "./components/ResearchWorkspace";
import StartupStudio from "./components/StartupStudio";
import FocusWorkspace from "./components/FocusWorkspace";
import Header from "./components/Header";
import LeftFloatingBar from "./components/LeftFloatingBar";
import SettingsModal from "./components/SettingsModal";
import { UserProfile, ChatSession, Note, Message, Notification, SupportTicket } from "./types";
import { auth, db } from "./lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-1",
      title: "OmniMind Premium Active",
      description: "Welcome to your personal Premium workspace! Try our AI Chat, Smart Notes, Research, and Startup Studio.",
      timestamp: "10 mins ago",
      read: false,
      type: "success"
    },
    {
      id: "notif-2",
      title: "Streak Reward Active",
      description: "Your 1-Day streak is currently active. Maintain your daily study habit to earn premium level badges!",
      timestamp: "1 hour ago",
      read: true,
      type: "xp"
    }
  ]);

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "ticket-1",
      subject: "API Key Integration Setup help",
      category: "Account Issue",
      description: "I wanted to understand where to provide the GEMINI_API_KEY environment variable.",
      status: "Resolved",
      createdAt: "Today, 11:20 AM",
      replies: [
        {
          role: "agent",
          content: "Hello! You can easily set your GEMINI_API_KEY in the platform's Settings menu. The secret key is stored securely on the server side and never sent to the client.",
          timestamp: "Today, 11:32 AM"
        }
      ]
    }
  ]);

  // Seed initial mock sessions
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "session-1",
      title: "Refactoring Auth Service",
      timestamp: "2 hours ago",
      expertId: "architect",
      messages: [
        {
          role: "user",
          content: "Let's review auth_service.py for security vulnerabilities.",
          timestamp: "10:15 AM"
        },
        {
          role: "model",
          content: "I've loaded the active file. On line 08, I've detected a hardcoded 'SECRET_KEY'. This represents an insecure credential leakage vulnerability.",
          timestamp: "10:16 AM"
        }
      ]
    },
    {
      id: "session-2",
      title: "Quantum Computing Basics",
      timestamp: "Yesterday",
      expertId: "academic",
      messages: [
        {
          role: "user",
          content: "Explain quantum superposition in a simple way.",
          timestamp: "3:40 PM"
        },
        {
          role: "model",
          content: "Think of a spinning coin. While it's spinning, it is both heads and tails simultaneously. Only when you stop it (measure it) does it collapse into a single state.",
          timestamp: "3:41 PM"
        }
      ]
    }
  ]);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>("session-1");

  const [activeNote, setActiveNote] = useState<Note>({
    title: "My Study Notes",
    content: "Welcome to your smart notes workspace!\n\nDraft your study materials directly in this editor, or upload a note/PDF document below to generate interactive multiple-choice quizzes and flashcard decks using the AI Quiz Wizard.",
    links: []
  });

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setActiveTab("dashboard");
  };

  // Sync user profile progress to Firestore in the background or local storage if guest
  useEffect(() => {
    if (!user) return;
    const dbUserId = localStorage.getItem("omnimind_db_user_id");
    if (dbUserId) {
      const syncProfile = async () => {
        try {
          await setDoc(doc(db, "app_users", dbUserId), user, { merge: true });
        } catch (e) {
          console.error("Error syncing direct db profile to Firestore:", e);
        }
      };
      const timeout = setTimeout(syncProfile, 500);
      return () => clearTimeout(timeout);
    } else if (auth.currentUser) {
      const syncProfile = async () => {
        try {
          await setDoc(doc(db, "users", auth.currentUser!.uid), user, { merge: true });
        } catch (e) {
          console.error("Error syncing profile progress to Firestore:", e);
        }
      };
      // Debounce state writes slightly to prevent excessive API writes
      const timeout = setTimeout(syncProfile, 500);
      return () => clearTimeout(timeout);
    } else {
      localStorage.setItem("omnimind_guest_profile", JSON.stringify(user));
    }
  }, [user]);

  // Handle Firebase Auth and Direct DB Session Restoration on page refresh
  useEffect(() => {
    const dbUserId = localStorage.getItem("omnimind_db_user_id");
    if (dbUserId) {
      const restoreDbUser = async () => {
        try {
          const userDoc = await getDoc(doc(db, "app_users", dbUserId));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
            setActiveTab("dashboard");
            return;
          }
        } catch (e) {
          console.error("Error restoring direct database user session:", e);
        }
        // Fallback if document lookup failed or didn't exist
        initializeFirebaseAuthListener();
      };
      restoreDbUser();
    } else {
      initializeFirebaseAuthListener();
    }

    function initializeFirebaseAuthListener() {
      const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
        if (fbUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            if (userDoc.exists()) {
              setUser(userDoc.data() as UserProfile);
              setActiveTab("dashboard");
            } else {
              // Fallback profile if user exists in auth but no doc in Firestore
              const fallbackProfile: UserProfile = {
                name: fbUser.displayName || fbUser.email?.split("@")[0] || "Scholar",
                email: fbUser.email || "",
                level: 1,
                xp: 250,
                xpMax: 1000,
                streak: 1
              };
              await setDoc(doc(db, "users", fbUser.uid), fallbackProfile);
              setUser(fallbackProfile);
              setActiveTab("dashboard");
            }
          } catch (e) {
            console.error("Error restoring user session:", e);
          }
        } else {
          // If not logged in via Firebase, check local storage for offline session
          const savedGuest = localStorage.getItem("omnimind_guest_profile");
          if (savedGuest) {
            try {
              setUser(JSON.parse(savedGuest));
              setActiveTab("dashboard");
            } catch (e) {
              localStorage.removeItem("omnimind_guest_profile");
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      });
      return unsubscribe;
    }
  }, []);

  const gainXp = (amount: number) => {
    if (!user) return;
    let leveledUp = false;
    let nextLevel = user.level;
    setUser(prev => {
      if (!prev) return null;
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newXpMax = prev.xpMax;
      while (newXp >= newXpMax) {
        newXp -= newXpMax;
        newLevel += 1;
        newXpMax = Math.round(newXpMax * 1.25);
        leveledUp = true;
        nextLevel = newLevel;
      }
      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpMax: newXpMax
      };
    });

    handleAddNotification(
      `Received +${amount} XP`, 
      `XP milestone rewarded for workspace progress. Keep up the momentum!`, 
      "xp"
    );

    if (leveledUp) {
      setTimeout(() => {
        handleAddNotification(
          `Level Up! reached Level ${nextLevel}`, 
          `Congratulations! You've unlocked new AI analysis capabilities inside OmniMind.`, 
          "level"
        );
      }, 600);
    }
  };

  const handleAddNotification = (title: string, description: string, type: 'xp' | 'level' | 'info' | 'success') => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      description,
      timestamp: "Just now",
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleAddTicket = (subject: string, category: string, description: string) => {
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      subject,
      category,
      description,
      status: "Open",
      createdAt: "Just now",
      replies: []
    };
    setTickets(prev => [newTicket, ...prev]);

    // Simulate agent reply
    setTimeout(() => {
      setTickets(prev => prev.map(t => {
        if (t.id === newTicket.id) {
          return {
            ...t,
            status: "In Progress",
            replies: [
              {
                role: "agent",
                content: `Hi ${user?.name || "there"}! Our support desk has received your ticket regarding: "${subject}". An engineer has been dispatched to investigate this ${category.toLowerCase()} issue. We appreciate your patience!`,
                timestamp: "Just now"
              }
            ]
          };
        }
        return t;
      }));
      handleAddNotification("Support ticket assigned", `Support representative is addressing: "${subject}"`, "info");
    }, 4000);
  };

  const handleAddTicketReply = (ticketId: string, content: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          replies: [
            ...t.replies,
            {
              role: "user",
              content,
              timestamp: "Just now"
            }
          ]
        };
      }
      return t;
    }));

    setTimeout(() => {
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: "Resolved",
            replies: [
              ...t.replies,
              {
                role: "agent",
                content: "Our systems team has checked the workspace logs and successfully deployed a patch. This ticket is now resolved. Please let us know if you require any further assistance!",
                timestamp: "Just now"
              }
            ]
          };
        }
        return t;
      }));
      handleAddNotification("Support ticket resolved", "Your active inquiry has been marked as completed.", "success");
    }, 4500);
  };

  const handleResetData = () => {
    if (user) {
      setUser({
        name: user.name,
        email: user.email,
        level: 1,
        xp: 0,
        xpMax: 1000,
        streak: 1
      });
    }
    setActiveNote({
      title: "Quantum Neural Architectures",
      content: "The fundamental premise of neural architecture search (NAS) relies on the optimization of weighted pathways.\n\nWhen considering quantum-classical hybrids, the noise floor becomes a critical factor in decoherence management. Optimal configurations must incorporate error-correcting topologies.",
      links: []
    });
    setNotifications([
      {
        id: "notif-reset",
        title: "Workspace Flushed",
        description: "All notes, workspace data, custom mind maps, and accumulated XP have been reset.",
        timestamp: "Just now",
        read: false,
        type: "info"
      }
    ]);
  };

  const handleLogout = () => {
    auth.signOut().catch(err => console.error("Error signing out:", err));
    localStorage.removeItem("omnimind_guest_profile");
    setUser(null);
    setActiveTab("landing");
  };

  const handleNewSession = (expertId: string) => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `Session with Expert (${expertId})`,
      timestamp: "Just now",
      expertId,
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setSelectedSessionId(newId);
    setActiveTab("chat");
  };

  const handleUpdateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        // Auto-extract first prompt for title if empty
        const firstUserPrompt = messages.find(m => m.role === 'user')?.content || s.title;
        const cleanTitle = firstUserPrompt.length > 28 ? firstUserPrompt.slice(0, 25) + "..." : firstUserPrompt;
        return {
          ...s,
          title: cleanTitle,
          messages
        };
      }
      return s;
    }));
  };

  const handleSelectChatFromDashboard = (chatId: string) => {
    setSelectedSessionId(chatId);
    setActiveTab("chat");
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden select-none transition-colors duration-300 selection:bg-[#d0bcff]/40 ${
      theme === 'light' ? 'theme-light bg-slate-100 text-slate-900' : 'theme-dark bg-[#0a0a0f] text-white'
    }`}>
      {/* Background Mesh Gradients - only visible in dark mode */}
      {theme === 'dark' && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-pink-500/10 blur-[100px]"></div>
        </div>
      )}

      {activeTab === "landing" && (
        <LandingPage 
          onGetStarted={() => setActiveTab("auth")} 
          onSelectTab={() => setActiveTab("auth")}
        />
      )}

      {activeTab === "auth" && (
        <AuthPage 
          onLoginSuccess={handleLoginSuccess} 
          onBack={() => setActiveTab("landing")}
        />
      )}

      {activeTab !== "landing" && activeTab !== "auth" && user && (
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header 
            user={user} 
            onLogout={handleLogout} 
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onClearNotifications={handleClearNotifications}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          
          <main className="flex-1 overflow-y-auto pl-20 xs:pl-24 sm:pl-28 md:pl-32 lg:pl-36 pr-4 sm:pr-6 py-6 pb-24 max-w-4xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <Dashboard 
                    user={user} 
                    sessions={sessions}
                    onSelectTab={setActiveTab}
                    onSelectChat={handleSelectChatFromDashboard}
                    onGainXp={gainXp}
                    activeNote={activeNote}
                  />
                </motion.div>
              )}

              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <ChatWorkspace 
                    sessions={sessions}
                    selectedSessionId={selectedSessionId}
                    onNewSession={handleNewSession}
                    onSendMessage={(sessId, txt) => {}}
                    onUpdateSessionMessages={handleUpdateSessionMessages}
                    onGainXp={gainXp}
                  />
                </motion.div>
              )}

              {activeTab === "learning" && (
                <motion.div
                  key="learning"
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <NoteWorkspace 
                    note={activeNote}
                    onUpdateNote={setActiveNote}
                    onGainXp={gainXp}
                  />
                </motion.div>
              )}

              {activeTab === "research" && (
                <motion.div
                  key="research"
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <ResearchWorkspace onGainXp={gainXp} />
                </motion.div>
              )}

              {activeTab === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <CodeWorkspace onGainXp={gainXp} />
                </motion.div>
              )}

              {activeTab === "startup" && (
                <motion.div
                  key="startup"
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <StartupStudio onGainXp={gainXp} />
                </motion.div>
              )}

              {activeTab === "focus" && (
                <motion.div
                  key="focus"
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <FocusWorkspace onGainXp={gainXp} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <LeftFloatingBar activeTab={activeTab} onSelectTab={setActiveTab} user={user} />

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            user={user}
            onUpdateUser={setUser}
            onResetData={handleResetData}
            onAddNotification={handleAddNotification}
            tickets={tickets}
            onAddTicket={handleAddTicket}
            onAddTicketReply={handleAddTicketReply}
          />
        </div>
      )}
    </div>
  );
}
