import React from 'react';
import type { Candidate } from '../types';
import MatchDonutChart from './MatchDonutChart';
import { LinkedInIcon } from './Icons';

interface CandidateCardProps {
  candidate: Candidate;
  onAddToPipeline?: (candidate: Candidate) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onAddToPipeline }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-start gap-4">
      <div className="flex-shrink-0">
        <MatchDonutChart percentage={candidate.match} size={64} strokeWidth={6} />
      </div>
      <div className="text-left flex-1">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-base font-bold text-gray-100">{candidate.name}</h3>
                {candidate.currentRole && (
                    <p className="text-xs text-cyan-400 font-medium tracking-wide uppercase">{candidate.currentRole}</p>
                )}
            </div>
             {candidate.linkedinUrl && (
                <a 
                    href={candidate.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={`${candidate.name}'s LinkedIn Profile`}
                    className="flex-shrink-0 text-gray-400 hover:text-blue-400 transition-colors duration-200 p-1 -mr-1"
                >
                    <LinkedInIcon className="w-5 h-5" />
                </a>
            )}
        </div>
        
        <p className="text-sm text-gray-300 leading-snug">{candidate.summary}</p>
        
        {candidate.yearsOfExperience !== undefined && (
          <div className="mt-3">
              <span className="inline-block bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {candidate.yearsOfExperience} {candidate.yearsOfExperience === 1 ? 'year' : 'years'} of experience
              </span>
          </div>
        )}
        {onAddToPipeline && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => onAddToPipeline(candidate)}
              className="text-xs font-semibold px-3 py-1 rounded-md border border-cyan-500 text-cyan-300 hover:bg-cyan-500/10"
            >
              Add to pipeline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
