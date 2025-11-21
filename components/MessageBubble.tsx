import React, { useState } from 'react';
import { Message, Theme } from '../types';
import ReactMarkdown from 'react-markdown';
import { LOGO_URL } from '../constants';

interface MessageBubbleProps {
  message: Message;
  theme: Theme;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, theme }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
      <div className={`flex max-w-[90%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden border ${
          isUser 
            ? (isDark ? 'bg-slate-700 text-white border-white/10' : 'bg-slate-200 text-slate-600 border-slate-300')
            : 'bg-black border-white/10' // AI Avatar always black bg for logo
        }`}>
           {isUser ? (
             <span className="material-symbols-rounded text-sm">person</span>
           ) : (
             <img src={LOGO_URL} alt="Lewis Mabe AI" className="w-full h-full object-cover" />
           )}
        </div>

        {/* Bubble Container */}
        <div className="flex flex-col gap-1 w-full min-w-0">
          
          {/* Attachments (Images/Files) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`flex flex-wrap gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {message.attachments.map((att, index) => (
                <div key={index} className={`relative rounded-xl overflow-hidden shadow-md max-w-[200px] border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  {att.type === 'image' ? (
                    <img 
                      src={`data:${att.mimeType};base64,${att.data}`} 
                      alt="Attachment" 
                      className="w-full h-auto object-cover"
                    />
                  ) : att.type === 'audio' ? (
                    <div className={`${isDark ? 'bg-[#1E293B] text-slate-300' : 'bg-white text-slate-700'} p-3 flex items-center gap-2 text-xs min-w-[150px]`}>
                      <span className="material-symbols-rounded text-brand-yellow">mic</span>
                      Audio Clip
                    </div>
                  ) : (
                    <div className={`${isDark ? 'bg-[#1E293B] text-slate-300' : 'bg-white text-slate-700'} p-3 flex items-center gap-2 text-xs min-w-[150px]`}>
                      <span className="material-symbols-rounded text-brand-yellow">description</span>
                      File Attached
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text Bubble */}
          <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-brand-yellow text-brand-dark rounded-tr-none shadow-md'
              : (isDark 
                  ? 'bg-[#1E293B] text-slate-100 border border-white/5' 
                  : 'bg-white text-slate-800 border border-slate-200') + ' rounded-tl-none'
          }`}>
            <div className={`markdown-content text-[15px] leading-relaxed break-words ${isUser ? 'font-medium' : 'font-normal'}`}>
              {isUser ? (
                message.text
              ) : (
                 <ReactMarkdown
                    components={{
                      ul: ({node, ...props}) => <ul className={`list-disc ml-5 space-y-1 my-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} {...props} />,
                      ol: ({node, ...props}) => <ol className={`list-decimal ml-5 space-y-1 my-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      strong: ({node, ...props}) => <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} {...props} />,
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      h1: ({node, ...props}) => <h1 className={`text-lg font-bold mt-3 mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`} {...props} />,
                      h2: ({node, ...props}) => <h2 className={`text-base font-bold mt-3 mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`} {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className={`border-l-4 border-brand-yellow pl-4 italic my-2 py-1 pr-2 rounded-r ${isDark ? 'text-slate-400 bg-black/20' : 'text-slate-500 bg-slate-50'}`} {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-500 hover:text-blue-400 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
                    }}
                 >
                   {message.text}
                 </ReactMarkdown>
              )}
            </div>
            
            {/* Footer: Time + Actions */}
            <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-between'}`}>
              {!isUser && (
                <button 
                  onClick={handleCopy}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isDark ? 'text-slate-500 hover:text-brand-yellow' : 'text-slate-400 hover:text-brand-dark'}`}
                  title="Copy text"
                >
                  <span className="material-symbols-rounded text-[14px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              )}
              
              <div className="text-[10px] opacity-60 flex items-center gap-1 select-none">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isUser && <span className="material-symbols-rounded text-[10px]">done_all</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};