
import React, { useEffect, useRef, useState } from 'react';
import { Message, Attachment } from '../types';
import { MessageBubble } from './MessageBubble';
import { LOGO_URL } from '../constants';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  onToggleSidebar: () => void;
  onExportChat: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onToggleSidebar,
  onExportChat
}) => {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, attachments]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((inputValue.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(inputValue, attachments);
      setInputValue('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // File Handling
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = (event.target.result as string).split(',')[1];
          
          // Determine type based on mime type
          let type: 'image' | 'audio' | 'file' = 'file'; // Default to generic file
          if (file.type.startsWith('image/')) type = 'image';
          if (file.type.startsWith('audio/')) type = 'audio';

          const newAttachment: Attachment = {
            type: type as any, // Casting to fit existing type definition
            mimeType: file.type,
            data: base64String
          };
          setAttachments(prev => [...prev, newAttachment]);
        }
      };
      
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Voice Recording
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create blob with the specific recorder's mime type for better compatibility
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            if (reader.result) {
              const base64data = (reader.result as string).split(',')[1];
              const newAttachment: Attachment = {
                  type: 'audio',
                  mimeType: mimeType, 
                  data: base64data
              };
              setAttachments(prev => [...prev, newAttachment]);
            }
        };
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full relative bg-gradient-to-b from-brand-dark via-[#131C2D] to-brand-dark">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-16 glass-header z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-rounded">menu</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-black shadow-lg">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-semibold text-lg tracking-tight">Lewis Mabe AI</h1>
              <div className="text-xs text-brand-yellow flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse"></span>
                Online
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onExportChat}
          className="text-slate-400 hover:text-brand-yellow p-2 rounded-lg hover:bg-white/5 transition-all flex items-center gap-2 text-sm"
          title="Export Chat History"
        >
          <span className="material-symbols-rounded">download</span>
          <span className="hidden sm:inline">Export</span>
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-20 pb-4 px-4 md:px-8 lg:px-20 custom-scrollbar">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end">
           {/* Intro Placeholder if empty */}
           {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center py-10 text-center opacity-80">
               <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-6 border border-brand-yellow/30 shadow-2xl overflow-hidden">
                 <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover opacity-90" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Mabe Fitness AI</h3>
               <p className="text-slate-400 max-w-md text-sm leading-relaxed">
                 Strong, pain-free, sustainable. I'm here to help you train smarter.
                 Send me a message, upload a form video frame, or record a voice note.
               </p>
               <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                 {[
                   "How do I fix my squat depth?",
                   "I don't have time to train 6 days a week.",
                   "What's a good protein target?",
                   "My lower back hurts when I deadlift."
                 ].map((prompt, idx) => (
                   <button 
                    key={idx}
                    onClick={() => onSendMessage(prompt, [])}
                    className="text-sm text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-yellow/30 transition-all text-slate-300 hover:text-brand-yellow"
                   >
                     {prompt}
                   </button>
                 ))}
               </div>
             </div>
           )}

           {messages.map((msg) => (
             <MessageBubble key={msg.id} message={msg} />
           ))}
           
           {isLoading && (
             <div className="flex w-full mb-6 justify-start animate-fade-in">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
                   <img src={LOGO_URL} alt="AI" className="w-full h-full object-cover" />
                 </div>
                 <div className="bg-[#1E293B] px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1">
                   <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 glass-panel border-t border-white/5 bg-brand-dark/90 z-30">
        <div className="max-w-3xl mx-auto relative">
          
          {/* Pending Attachments */}
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative group flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/20 bg-black/50 flex items-center justify-center">
                    {att.type === 'image' ? (
                      <img src={`data:${att.mimeType};base64,${att.data}`} className="w-full h-full object-cover" alt="upload" />
                    ) : att.type === 'audio' ? (
                      <span className="material-symbols-rounded text-brand-yellow">mic</span>
                    ) : (
                      <span className="material-symbols-rounded text-slate-300">description</span>
                    )}
                  </div>
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
                  >
                    <span className="material-symbols-rounded text-[12px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-[#1E293B] rounded-2xl p-2 border border-white/10 focus-within:border-brand-yellow/50 transition-colors shadow-lg">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="*" 
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-400 hover:text-brand-yellow transition-colors rounded-xl hover:bg-white/5"
              title="Attach File"
            >
              <span className="material-symbols-rounded">attach_file</span>
            </button>
            
            <button 
              onClick={toggleRecording}
              className={`p-2.5 transition-all rounded-xl hover:bg-white/5 ${isRecording ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-slate-400 hover:text-brand-yellow'}`}
              title={isRecording ? "Stop Recording" : "Start Recording"}
            >
              <span className="material-symbols-rounded">{isRecording ? 'stop_circle' : 'mic'}</span>
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : "Message Lewis..."}
              className="w-full bg-transparent text-white placeholder-slate-500 resize-none py-3 px-2 focus:outline-none max-h-[120px] scrollbar-thin"
              style={{ minHeight: '44px' }}
            />
            
            <button 
              onClick={handleSend}
              disabled={(!inputValue.trim() && attachments.length === 0) || isLoading}
              className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                (inputValue.trim() || attachments.length > 0) && !isLoading
                  ? 'bg-brand-yellow text-brand-dark hover:bg-yellow-300 shadow-lg shadow-yellow-900/20 transform hover:scale-105' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-rounded">send</span>
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-500">
               Coach Lewis AI. Click Mic to speak. Attach images/files for analysis.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
