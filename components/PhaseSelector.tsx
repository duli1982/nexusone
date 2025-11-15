import React from 'react';
import type { RecruitmentPhase } from '../types';
import { RECRUITMENT_PHASES } from '../constants';

interface PhaseSelectorProps {
  activePhaseId: string;
  onPhaseChange: (id: string) => void;
  isLoading: boolean;
}

const PhaseSelector: React.FC<PhaseSelectorProps> = ({ activePhaseId, onPhaseChange, isLoading }) => {
  return (
    <div className="border-b border-gray-700">
      <nav className="-mb-px flex space-x-6 px-4 sm:px-6" aria-label="Tabs">
        {RECRUITMENT_PHASES.map((phase: RecruitmentPhase) => (
          <button
            key={phase.id}
            onClick={() => onPhaseChange(phase.id)}
            disabled={isLoading}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
              disabled:cursor-not-allowed disabled:text-gray-600 disabled:hover:border-transparent
              ${
                activePhaseId === phase.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }
            `}
          >
            {phase.title}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default PhaseSelector;