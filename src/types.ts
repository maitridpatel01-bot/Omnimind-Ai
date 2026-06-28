/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  image?: string;
  sources?: Array<{ title: string; uri: string }>;
}

export interface ChatSession {
  id: string;
  title: string;
  expertId: string;
  messages: Message[];
  timestamp: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  links: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface Expert {
  id: string;
  name: string;
  title: string;
  avatar: string;
  description: string;
  longDescription: string;
  accent: string;
  icon: string;
  systemPrompt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  level: number;
  xp: number;
  xpMax: number;
  streak: number;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'xp' | 'level' | 'info' | 'success';
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  replies: Array<{
    role: 'user' | 'agent';
    content: string;
    timestamp: string;
  }>;
}

export interface ATSReview {
  score: number;
  status: 'Optimal' | 'Review Needed' | 'Critical';
  feedback: string;
  improvements: string[];
}
