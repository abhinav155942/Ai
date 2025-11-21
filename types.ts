export interface Attachment {
  type: 'image' | 'audio';
  mimeType: string;
  data: string; // base64
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachments?: Attachment[];
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessageTimestamp: number;
  messages: Message[];
}

export type Theme = 'light' | 'dark';

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isSidebarOpen: boolean;
  isLoading: boolean;
  theme: Theme;
}