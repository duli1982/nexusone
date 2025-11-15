import React, { useState } from 'react';
import { CopyIcon, LinkedInIcon } from './Icons';

interface LinkedInSearchCardProps {
  searchQuery: string;
  explanation: string;
}

const LinkedInSearchCard: React.FC<LinkedInSearchCardProps> = ({ searchQuery, explanation }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(searchQuery).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Failed');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    });
  };

  const linkedInSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`;

  return (
    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 my-4 space-y-4">
      <h3 className="text-base font-bold text-gray-100">LinkedIn Search Assistant</h3>
      <p className="text-xs text-gray-300 italic">{explanation}</p>
      
      <div className="bg-gray-900/70 rounded-md p-3 overflow-x-auto">
        <code className="text-xs text-cyan-300 break-words whitespace-pre-wrap">{searchQuery}</code>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-200 bg-gray-600/50 rounded-md hover:bg-gray-600 transition-colors"
        >
          <CopyIcon className="w-3.5 h-3.5" />
          {copyButtonText}
        </button>
        <a
          href={linkedInSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors"
        >
          <LinkedInIcon className="w-3.5 h-3.5" />
          Search on LinkedIn
        </a>
      </div>
    </div>
  );
};

export default LinkedInSearchCard;
