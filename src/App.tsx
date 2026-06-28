/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import ChatWorkspace from "./components/ChatWorkspace";
import NoteWorkspace from "./components/NoteWorkspace";
import CodeWorkspace from "./components/CodeWorkspace";
import ResearchWorkspace from "./components/ResearchWorkspace";
import StartupStudio from "./components/StartupStudio";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import SettingsModal from "./components/SettingsModal";
import { UserProfile, ChatSession, Note, Message, Notification, SupportTicket } from "./types";

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
    title: "Quantum Neural Architectures",
    content: "The fundamental premise of neural architecture search (NAS) relies on the optimization of weighted pathways.\n\nWhen considering quantum-classical hybrids, the noise floor becomes a critical factor in decoherence management. Optimal configurations must incorporate error-correcting topologies.",
    links: []
  });

  const handleLoginSuccess = (name: string, email: string) => {
    setUser({
      name,
      email,
      level: 1,
      xp: 250,
      xpMax: 1000,
      streak: 1
    });
    setActiveTab("dashboard");
  };

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
          
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-32 max-w-4xl mx-auto w-full">
            {activeTab === "dashboard" && (
              <Dashboard 
                user={user} 
                sessions={sessions}
                onSelectTab={setActiveTab}
                onSelectChat={handleSelectChatFromDashboard}
                onGainXp={gainXp}
                activeNote={activeNote}
              />
            )}

            {activeTab === "chat" && (
              <ChatWorkspace 
                sessions={sessions}
                selectedSessionId={selectedSessionId}
                onNewSession={handleNewSession}
                onSendMessage={(sessId, txt) => {}}
                onUpdateSessionMessages={handleUpdateSessionMessages}
                onGainXp={gainXp}
              />
            )}

            {activeTab === "learning" && (
              <NoteWorkspace 
                note={activeNote}
                onUpdateNote={setActiveNote}
                onGainXp={gainXp}
              />
            )}

            {activeTab === "research" && (
              <ResearchWorkspace onGainXp={gainXp} />
            )}

            {activeTab === "code" && (
              <CodeWorkspace onGainXp={gainXp} />
            )}

            {activeTab === "startup" && (
              <StartupStudio onGainXp={gainXp} />
            )}
          </main>

          <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

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
