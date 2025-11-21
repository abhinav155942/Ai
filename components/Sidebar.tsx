import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div 
        className={`fixed md:relative inset-y-0 left-0 z-50 w-[280px] bg-[#1E293B] md:bg-transparent flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:border-r md:border-white/10`}
      >
        <div className="p-4 glass-header md:bg-transparent md:backdrop-none md:border-b-0">
           <button 
             onClick={onNewChat}
             className="w-full flex items-center justify-center gap-2 bg-brand-yellow text-brand-dark font-semibold py-3 px-4 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-900/20"
           >
             <span className="material-symbols-rounded">edit_square</span>
             New Chat
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          <div className="text-xs font-medium text-slate-400 px-3 py-2 uppercase tracking-wider">Recent Coaching</div>
          {sessions.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-8">No history yet.</div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 group ${
                  currentSessionId === session.id
                    ? 'bg-white/10 text-white font-medium border border-white/5'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className={`material-symbols-rounded text-[18px] ${
                  currentSessionId === session.id ? 'text-brand-yellow' : 'text-slate-500 group-hover:text-slate-300'
                }`}>chat_bubble</span>
                <span className="truncate flex-1">{session.title}</span>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 text-xs text-slate-500 text-center">
          Lewis Mabe AI v1.0
        </div>
      </div>
    </>
  );
};
