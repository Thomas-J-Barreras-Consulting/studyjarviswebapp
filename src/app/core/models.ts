export type Role = 'user' | 'assistant';
export type MessageKind = 'ask' | 'notes' | 'keypoints' | 'quiz' | 'studyguide' | 'typing' | 'error';
export type MessageStatus = 'pending' | 'done' | 'error';

export interface Message {
  id: string;
  role: Role;
  kind: MessageKind;
  markdown: string;
  timestamp: number;
  status?: MessageStatus;
  quiz?: Quiz;
  errorText?: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'uploaded' | 'preparing' | 'ready' | 'failed';
  errorText?: string;
}

export interface Conversation {
  id: string;
  title: string;
  fileIds: string[];
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type QuizKind = 'multiple-choice' | 'short-answer';

export interface Choice {
  key: string;
  text: string;
}

export interface Question {
  id: string;
  stem: string;
  choices?: Choice[];
  correctKey?: string;
  explanation?: string;
  userAnswer?: string;
  answered?: boolean;
  correct?: boolean;
}

export interface Quiz {
  id: string;
  kind: QuizKind;
  questions: Question[];
  sourceMarkdown: string;
  currentIndex: number;
  completed: boolean;
}
