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
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <Sparkles size={32} className="text-blue-500" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">AI Assistant</h3>
          <p className="text-slate-500 mb-6 max-w-xs">
            Ask questions about the article, get explanations, or request summaries.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 w-full max-w-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Sparkles size={16} className="text-blue-600" aria-hidden="true" />
              </div>
              <p className="text-slate-700 text-sm">
                "What is the main theme of this article?" or "Explain the concept of career pivots"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the article..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Ask AI assistant about the article"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={!input.trim()}
            aria-label="Send question to AI"
          >
            <Send size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
};