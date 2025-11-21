import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { ChatSession, Message, Attachment } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { DEFAULT_GREETING } from './constants';

const STORAGE_KEY = 'lewis_ai_sessions';

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedSessions = JSON.parse(saved);
        setSessions(parsedSessions);
        if (parsedSessions.length > 0) {
          setCurrentSessionId(parsedSessions[0].id);
        } else {
          createNewSession();
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save to local storage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Coaching Session',
      lastMessageTimestamp: Date.now(),
      messages: [{
        id: uuidv4(),
        role: 'model',
        text: DEFAULT_GREETING,
        timestamp: Date.now()
      }]
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const getCurrentSession = () => sessions.find(s => s.id === currentSessionId);

  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    if (!currentSessionId) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
      attachments: attachments
    };

    // Update UI immediately with user message
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const isFirstUserMessage = s.messages.length <= 1;
        const newTitle = isFirstUserMessage && text 
          ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) 
          : (s.title === 'New Coaching Session' && text ? (text.slice(0, 30) + '...') : s.title);
        
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMsg],
          lastMessageTimestamp: Date.now()
        };
      }
      return s;
    }));

    setIsLoading(true);

    // Get context from current session
    const currentSession = sessions.find(s => s.id === currentSessionId);
    const history = currentSession ? [...currentSession.messages, userMsg] : [userMsg];

    const responseText = await sendMessageToGemini(history, text, attachments);

    const botMsg: Message = {
      id: uuidv4(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, botMsg],
          lastMessageTimestamp: Date.now()
        };
      }
      return s;
    }));

    setIsLoading(false);
  };

  const handleExportChat = () => {
    const session = getCurrentSession();
    if (!session) return;

    const exportText = session.messages.map(msg => {
        const time = new Date(msg.timestamp).toLocaleString();
        const sender = msg.role === 'user' ? 'You' : 'Lewis Mabe AI';
        const attachmentNote = msg.attachments?.length ? `[Attached ${msg.attachments.length} file(s)]` : '';
        return `[${time}] ${sender}: ${msg.text} ${attachmentNote}`;
    }).join('\n\n');

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mabe-fitness-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const activeSession = getCurrentSession();

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark text-white font-sans selection:bg-brand-yellow selection:text-brand-dark">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewSession}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        {activeSession ? (
          <ChatInterface 
            messages={activeSession.messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onToggleSidebar={toggleSidebar}
            onExportChat={handleExportChat}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <button onClick={createNewSession} className="bg-brand-yellow text-black px-6 py-3 rounded-full font-bold">
              Start Coaching
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;