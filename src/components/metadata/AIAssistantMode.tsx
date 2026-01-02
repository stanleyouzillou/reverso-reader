import React from 'react';
import { Sparkles, MessageCircle, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AIAssistantModeProps {
  className?: string;
}

export const AIAssistantMode: React.FC<AIAssistantModeProps> = ({
  className = ''
}) => {
  const [input, setInput] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the input to an AI service
    console.log('Sending to AI:', input);
    setInput('');
  };

  return (
    <div className={cn('flex flex-col h-full', className)} style={{ minHeight: 0 }}>
      <div className="flex-1 overflow-y-auto p-[1rem] bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center h-full text-center py-[3rem]">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-[1.5rem] rounded-full mb-[1.5rem]">
            <Sparkles size="2.5rem" className="text-blue-500 dark:text-blue-400" aria-hidden="true" />
          </div>
          <h3 className="text-[1.25rem] font-bold text-slate-700 dark:text-slate-300 mb-[0.75rem]">AI Assistant</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-[2rem] max-w-[20rem] text-[1rem]">
            Ask questions about the article, get explanations, or request summaries.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-[0.75rem] p-[1.5rem] w-full max-w-[28rem]">
            <div className="flex items-start gap-[1rem] mb-[1.5rem] text-left">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-[0.75rem] rounded-full shrink-0">
                <Sparkles size="1.25rem" className="text-blue-600 dark:text-blue-300" aria-hidden="true" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-[1rem]">
                "What is the main theme of this article?" or "Explain the concept of career pivots"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 p-[1rem] bg-white dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="flex gap-[0.75rem]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the article..."
            className="flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-[0.5rem] px-[1rem] py-[0.75rem] text-[1rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Ask AI assistant about the article"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-[0.75rem] rounded-[0.5rem] hover:bg-blue-700 disabled:opacity-50 transition-colors"
            disabled={!input.trim()}
            aria-label="Send question to AI"
          >
            <Send size="1.25rem" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
};