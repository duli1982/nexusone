import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PlusIcon } from './Icons';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onSavePlaybook?: (prompt: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading, onSavePlaybook }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="bg-gray-900/75 backdrop-blur-sm p-4 border-t border-gray-700">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-end bg-gray-800 border border-gray-600 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Nexus..."
            rows={1}
            className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none px-2 max-h-48 overflow-y-auto"
            disabled={isLoading}
          />
          {onSavePlaybook && (
            <button
              type="button"
              disabled={isLoading || !input.trim()}
              onClick={() => onSavePlaybook(input.trim())}
              className="mr-1 p-2 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0 text-xs"
              title="Save as playbook for this phase"
            >
              Save
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="ml-2 p-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputBar;
