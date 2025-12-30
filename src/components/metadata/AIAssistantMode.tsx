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
      <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
            <Sparkles size={40} className="text-blue-500 dark:text-blue-400" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">AI Assistant</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs text-base">
            Ask questions about the article, get explanations, or request summaries.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-start gap-4 mb-6 text-left">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full shrink-0">
                <Sparkles size={20} className="text-blue-600 dark:text-blue-300" aria-hidden="true" />
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                "What is the main theme of this article?" or "Explain the concept of career pivots"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the article..."
            className="flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Ask AI assistant about the article"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            disabled={!input.trim()}
            aria-label="Send question to AI"
          >
            <Send size={20} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
};