import React from 'react';
import { ChatSession, Theme } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onExportChat: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onExportChat,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

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
        className={`fixed md:relative inset-y-0 left-0 z-50 w-[280px] flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isDark ? 'bg-[#1E293B] md:border-white/10' : 'bg-white md:border-slate-200'} md:border-r md:bg-transparent`}
      >
        <div className="p-4 md:bg-transparent">
           <button 
             onClick={onNewChat}
             className="w-full flex items-center justify-center gap-2 bg-brand-yellow text-brand-dark font-semibold py-3 px-4 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-900/20"
           >
             <span className="material-symbols-rounded">edit_square</span>
             New Chat
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          <div className={`text-xs font-medium px-3 py-2 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recent Coaching</div>
          {sessions.length === 0 ? (
            <div className={`text-sm text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No history yet.</div>
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
                    ? (isDark ? 'bg-white/10 text-white border-white/5' : 'bg-slate-200 text-slate-900 border-slate-300')
                    : (isDark ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                } ${currentSessionId === session.id ? 'font-medium border' : ''}`}
              >
                <span className={`material-symbols-rounded text-[18px] ${
                  currentSessionId === session.id ? 'text-brand-yellow' : (isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600')
                }`}>chat_bubble</span>
                <span className="truncate flex-1">{session.title}</span>
              </button>
            ))
          )}
        </div>

        {/* Sidebar Footer: Export and Theme */}
        <div className={`p-4 border-t space-y-2 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          
          <button 
            onClick={onExportChat}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
              isDark ? 'text-slate-400 hover:bg-white/5 hover:text-brand-yellow' : 'text-slate-600 hover:bg-slate-100 hover:text-brand-dark'
            }`}
          >
            <span className="material-symbols-rounded">download</span>
            Export Chat
          </button>

          <button 
            onClick={onToggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
              isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-brand-dark'
            }`}
          >
            <span className="material-symbols-rounded">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className={`text-xs text-center pt-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            Lewis Mabe AI v1.1
          </div>
        </div>
      </div>
    </>
  );
};