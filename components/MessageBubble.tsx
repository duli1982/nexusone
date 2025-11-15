import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, MessageSender, Candidate } from '../types';
import { NexusIcon, UserIcon, EditIcon } from './Icons';
import CandidateCard from './CandidateCard';
import LinkedInSearchCard from './LinkedInSearchCard';

interface MessageBubbleProps {
  message: Message;
  onEditMessage?: (messageId: string, newText: string) => void;
  onAddCandidate?: (candidate: Candidate) => void;
}

const CandidateView: React.FC<{ candidates: Candidate[]; onAddCandidate?: (candidate: Candidate) => void }> = ({ candidates, onAddCandidate }) => (
    <div className="flex flex-col gap-3 my-4">
        {candidates.map((candidate, index) => (
            <CandidateCard key={index} candidate={candidate} onAddToPipeline={onAddCandidate} />
        ))}
    </div>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onEditMessage, onAddCandidate }) => {
  const isNexus = message.sender === MessageSender.NEXUS;
  const isUser = message.sender === MessageSender.USER;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const handleSave = () => {
    if (editText.trim() && onEditMessage) {
      onEditMessage(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(message.text);
  };
  
  return (
    <div className={`flex items-start gap-4 p-4 ${isNexus ? '' : 'justify-end'}`}>
      {isNexus && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          <NexusIcon className="h-6 w-6 text-blue-400" />
        </div>
      )}
      <div className={`relative group flex flex-col ${isNexus ? 'items-start' : 'items-end'}`}>
        {isUser && !isEditing && onEditMessage && (
            <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full pr-2">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label="Edit message"
                >
                    <EditIcon className="w-4 h-4" />
                </button>
            </div>
        )}
        <div 
            className={`
                w-full max-w-2xl xl:max-w-3xl rounded-xl p-4
                ${isNexus ? 'bg-gray-800 text-gray-200 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}
            `}
        >
          {isEditing ? (
              <div className="flex flex-col gap-2 w-full min-w-[300px]">
                <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-blue-700/50 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50 resize-y min-h-[80px]"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button onClick={handleCancel} className="px-3 py-1 text-xs font-semibold text-gray-200 bg-gray-600/50 rounded-md hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSave} className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-500">Save</button>
                </div>
              </div>
          ) : isNexus ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="text-sm leading-relaxed"
              components={{
                  h1: ({...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
                  h2: ({...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                  h3: ({...props}) => <h3 className="font-semibold my-2" {...props} />,
                  ul: ({...props}) => <ul className="list-disc list-outside pl-5 my-2 space-y-1" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal list-outside pl-5 my-2 space-y-1" {...props} />,
                  p: ({...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  strong: ({...props}) => <strong className="font-semibold" {...props} />,
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    if (!inline && match) {
                      const language = match[1];
                      const codeContent = String(children).trim();

                      if (language === 'candidates') {
                          try {
                              let jsonString = codeContent
                                  .replace(/(\r\n|\n|\r)/gm, " ")
                                  .replace(/,\s*([}\]])/g, "$1");

                              let candidates: Candidate[];
                              try {
                                  candidates = JSON.parse(jsonString);
                              } catch (e) {
                                  const repairedJsonString = jsonString.replace(/(?<![:{,\[\s])"(?![:}\],\s])/g, '\\"');
                                  candidates = JSON.parse(repairedJsonString);
                              }
                              
                              if (Array.isArray(candidates) && candidates.every(c => c && typeof c.name === 'string' && typeof c.match === 'number' && typeof c.summary === 'string')) {
                                  return <CandidateView candidates={candidates} onAddCandidate={onAddCandidate} />;
                              }
                              throw new Error("Parsed data is not a valid candidate array.");
                          } catch (e) {
                              console.error("Failed to parse candidate JSON:", e);
                              return <pre className="bg-gray-900 rounded-md p-3 my-2 text-xs overflow-x-auto text-red-400"><code className={className} {...props}>{"Error parsing candidate data. Raw output:\n" + children}</code></pre>;
                          }
                      }
                      
                      if (language === 'linkedin_search') {
                          try {
                              const searchData = JSON.parse(codeContent);
                              if (searchData && typeof searchData.searchQuery === 'string' && typeof searchData.explanation === 'string') {
                                  return <LinkedInSearchCard searchQuery={searchData.searchQuery} explanation={searchData.explanation} />;
                              }
                               throw new Error("Parsed data is not a valid LinkedIn search object.");
                          } catch (e) {
                              console.error("Failed to parse linkedin_search JSON:", e);
                              return <pre className="bg-gray-900 rounded-md p-3 my-2 text-xs overflow-x-auto text-red-400"><code className={className} {...props}>{"Error parsing LinkedIn search data. Raw output:\n" + children}</code></pre>;
                          }
                      }
                    }
                    
                    return inline ? (
                      <code className="bg-gray-700/50 rounded-sm px-1.5 py-1 text-xs font-mono" {...props}>{children}</code>
                    ) : (
                      <pre className="bg-gray-900 rounded-md p-3 my-2 text-xs overflow-x-auto"><code className={className} {...props}>{children}</code></pre>
                    );
                  },
                  blockquote: ({...props}) => <blockquote className="border-l-4 border-gray-600 pl-4 my-2 italic text-gray-400" {...props} />,
                  hr: ({...props}) => <hr className="my-4 border-gray-700" {...props} />,
                  a: ({...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
              }}
            >
              {message.text}
            </ReactMarkdown>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          )}
        </div>
      </div>
      {!isNexus && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
