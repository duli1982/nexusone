import React from 'react';
import type { RecruitmentPhase, Role, Playbook } from '../types';

interface PhaseActionsBarProps {
  activePhase: RecruitmentPhase | undefined;
  activeRole: Role | null;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  playbooks: Playbook[];
}

const PhaseActionsBar: React.FC<PhaseActionsBarProps> = ({
  activePhase,
  activeRole,
  onSendMessage,
  isLoading,
  playbooks,
}) => {
  if (!activePhase) return null;

  const roleTitle = activeRole?.title || 'this role';

  const actionsByPhase: Record<
    string,
    { label: string; prompt: string }[]
  > = {
    phase0: [
      {
        label: 'Refine job description',
        prompt: `Help me refine a clear, structured job description for ${roleTitle}. Use the role details we have (level, location, salary band, must-have skills, responsibilities) and propose a JD in sections: Overview, Responsibilities, Requirements, Nice-to-haves.`,
      },
      {
        label: 'Define ideal candidate profile',
        prompt: `Based on the current role details for ${roleTitle}, define an ideal candidate profile: background, years of experience, typical companies, core skills, and red flags.`,
      },
    ],
    phase1: [
      {
        label: 'Generate sourcing strategy',
        prompt: `For ${roleTitle}, propose a sourcing strategy: target channels, search keywords/Boolean strings, and 3 quick-win sourcing experiments I can run this week.`,
      },
      {
        label: 'Draft outreach messages',
        prompt: `Create 3 variants of a short, personalized outreach message for ${roleTitle}: one formal, one casual, and one very concise. Include placeholders for candidate name and company.`,
      },
    ],
    phase2: [
      {
        label: 'Summarize & shortlist candidates',
        prompt: `Looking at our current candidate pipeline for ${roleTitle}, propose a shortlist ranked by fit. Highlight why each candidate is strong and where there is risk or missing information.`,
      },
      {
        label: 'Create screening rubric',
        prompt: `Create a structured screening rubric for ${roleTitle} with 5–7 criteria, rating scale, and example evidence for "strong yes" vs "no".`,
      },
    ],
    phase3: [
      {
        label: 'Build interview plan',
        prompt: `Design an interview plan for ${roleTitle}: stages, who should be on the panel, what each stage should focus on, and suggested questions per stage.`,
      },
      {
        label: 'Draft panel brief',
        prompt: `Draft a short panel brief for ${roleTitle} that I can share with interviewers: role context, what "great" looks like, key risks to probe, and evaluation criteria.`,
      },
    ],
    phase4: [
      {
        label: 'Prepare offer summary',
        prompt: `Help me prepare an offer summary for the top candidate for ${roleTitle}: compensation breakdown, non-monetary benefits, and how to position the offer compellingly.`,
      },
      {
        label: 'Onboarding checklist',
        prompt: `Create a 30-60-90 day onboarding checklist for ${roleTitle}, focusing on outcomes, milestones, and alignment with stakeholders.`,
      },
    ],
  };

  const actions = actionsByPhase[activePhase.id] || [];

  const phasePlaybooks = playbooks.filter(
    (p) => !p.phaseId || p.phaseId === activePhase.id
  );
  if (actions.length === 0 && phasePlaybooks.length === 0) return null;

  return (
    <div className="border-b border-gray-800 bg-gray-900/40 px-4 py-2 flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={isLoading}
          onClick={() => onSendMessage(action.prompt)}
          className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full border border-gray-700 text-gray-200 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {action.label}
        </button>
      ))}
      {phasePlaybooks.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={isLoading}
          onClick={() => onSendMessage(p.prompt)}
          className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full border border-blue-700 text-blue-200 hover:bg-blue-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {p.title}
        </button>
      ))}
    </div>
  );
};

export default PhaseActionsBar;
