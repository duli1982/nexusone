import React, { useState } from 'react';
import type { Role, Candidate } from '../types';
import { CandidateStatus } from '../types';
import CandidateCard from './CandidateCard';

interface PipelinePanelProps {
  role: Role | null;
  onUpdateRole: (role: Role) => void;
  onSendMessage?: (prompt: string) => void;
}

const statusOptions: { value: CandidateStatus; label: string }[] = [
  { value: CandidateStatus.SOURCED, label: 'Sourced' },
  { value: CandidateStatus.CONTACTED, label: 'Contacted' },
  { value: CandidateStatus.RESPONDED, label: 'Responded' },
  { value: CandidateStatus.SCREENED, label: 'Screened' },
  { value: CandidateStatus.INTERVIEW, label: 'Interview' },
  { value: CandidateStatus.OFFER, label: 'Offer' },
  { value: CandidateStatus.HIRED, label: 'Hired' },
  { value: CandidateStatus.REJECTED, label: 'Rejected' },
];

const PipelinePanel: React.FC<PipelinePanelProps> = ({ role, onUpdateRole, onSendMessage }) => {
  if (!role) return null;

  const candidates = role.candidates || [];
  const [isCopyingShortlist, setIsCopyingShortlist] = useState(false);
  const [isCopyingPanel, setIsCopyingPanel] = useState(false);
  const [isCopyingOffer, setIsCopyingOffer] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleStatusChange = (candidateId: string | undefined, status: CandidateStatus) => {
    if (!candidateId) return;
    const updated: Role = {
      ...role,
      candidates: candidates.map((c) =>
        c.id === candidateId ? { ...c, status } : c
      ),
    };
    onUpdateRole(updated);
  };

  const handleFieldChange = (
    candidateId: string | undefined,
    field: keyof Candidate,
    value: string
  ) => {
    if (!candidateId) return;
    const updated: Role = {
      ...role,
      candidates: candidates.map((c) =>
        c.id === candidateId ? { ...c, [field]: value } : c
      ),
    };
    onUpdateRole(updated);
  };

  const handleCopyShortlist = async () => {
    if (!navigator.clipboard) return;
    setIsCopyingShortlist(true);
    try {
      const shortlist = candidates.filter((c) => {
        const s = c.status || CandidateStatus.SOURCED;
        return (
          s === CandidateStatus.SCREENED ||
          s === CandidateStatus.INTERVIEW ||
          s === CandidateStatus.OFFER ||
          s === CandidateStatus.HIRED
        );
      });
      const list = shortlist.length > 0 ? shortlist : candidates;
      const lines: string[] = [];
      lines.push(`# Shortlist for ${role.title || 'role'}`);
      lines.push('');
      list.forEach((c) => {
        lines.push(`- ${c.name} (${c.status || CandidateStatus.SOURCED}, match ${c.match}%)`);
        if (c.summary) lines.push(`  - Summary: ${c.summary}`);
        if (c.notes) lines.push(`  - Notes: ${c.notes}`);
        if (c.linkedinUrl) lines.push(`  - LinkedIn: ${c.linkedinUrl}`);
      });
      await navigator.clipboard.writeText(lines.join('\n'));
    } finally {
      setIsCopyingShortlist(false);
    }
  };

  const handleCopyPanelBrief = async () => {
    if (!navigator.clipboard) return;
    setIsCopyingPanel(true);
    try {
      const interviewCandidates = candidates.filter((c) => {
        const s = c.status || CandidateStatus.SOURCED;
        return s === CandidateStatus.INTERVIEW || s === CandidateStatus.SCREENED;
      });
      if (interviewCandidates.length === 0) return;
      const lines: string[] = [];
      lines.push(`# Interview panel brief for ${role.title || 'role'}`);
      lines.push('');
      interviewCandidates.forEach((c) => {
        lines.push(`- ${c.name} (${c.currentRole || 'current role n/a'}, match ${c.match}%)`);
        if (c.summary) lines.push(`  - Summary: ${c.summary}`);
        if (c.notes) lines.push(`  - Notes: ${c.notes}`);
        if (c.skills && c.skills.length > 0) {
          lines.push(`  - Focus areas: ${c.skills.join(', ')}`);
        }
      });
      lines.push('');
      lines.push('Suggested asks for the panel:');
      lines.push('- Confirm strengths and gaps against the core requirements.');
      lines.push('- Probe for ownership, collaboration, and decision-making.');
      lines.push('- Identify any risks or concerns to clarify before offer.');
      await navigator.clipboard.writeText(lines.join('\n'));
    } finally {
      setIsCopyingPanel(false);
    }
  };

  const handleCopyOfferSummary = async () => {
    if (!navigator.clipboard) return;
    setIsCopyingOffer(true);
    try {
      const offerCandidates = candidates.filter((c) => {
        const s = c.status || CandidateStatus.SOURCED;
        return s === CandidateStatus.OFFER || s === CandidateStatus.HIRED;
      });
      if (offerCandidates.length === 0) return;
      const lines: string[] = [];
      lines.push(`# Offer summary for ${role.title || 'role'}`);
      lines.push('');
      offerCandidates.forEach((c) => {
        lines.push(`- ${c.name} (${c.currentRole || 'current role n/a'}, match ${c.match}%)`);
        if (c.summary) lines.push(`  - Summary: ${c.summary}`);
        if (c.notes) lines.push(`  - Notes: ${c.notes}`);
        if (c.linkedinUrl) lines.push(`  - LinkedIn: ${c.linkedinUrl}`);
      });
      lines.push('');
      lines.push('Include in your internal approval thread:');
      lines.push('- Level and compensation recommendation.');
      lines.push('- Key reasons to hire now.');
      lines.push('- Main risks and how to mitigate them.');
      await navigator.clipboard.writeText(lines.join('\n'));
    } finally {
      setIsCopyingOffer(false);
    }
  };

  const toggleSelected = (candidateKey: string) => {
    setSelectedIds((prev) =>
      prev.includes(candidateKey)
        ? prev.filter((id) => id !== candidateKey)
        : [...prev, candidateKey]
    );
  };

  const handleCompareSelected = () => {
    if (!onSendMessage) return;
    const selected = candidates.filter((c) => selectedIds.includes(c.id || c.name));
    if (selected.length < 2) return;
    const roleTitle = role.title || 'this role';

    const lines: string[] = [];
    lines.push(
      `Please compare the following ${selected.length} candidates for the role "${roleTitle}".`
    );
    lines.push(
      'Create a concise table comparing: skills/experience fit, compensation or level risk (if you can infer it), interview/notes signals, and overall risk for each candidate.'
    );
    lines.push(
      'Then give a clear recommendation: who you would advance, any close calls, and key risks to watch.'
    );
    lines.push('');
    lines.push('Candidate details:');
    selected.forEach((c, index) => {
      lines.push(`Candidate ${index + 1}: ${c.name}`);
      lines.push(`- Status: ${c.status || CandidateStatus.SOURCED}`);
      lines.push(`- Match: ${c.match}%`);
      if (c.currentRole) lines.push(`- Current role: ${c.currentRole}`);
      if (c.summary) lines.push(`- Summary: ${c.summary}`);
      if (c.skills && c.skills.length > 0) {
        lines.push(`- Skills: ${c.skills.join(', ')}`);
      }
      if (c.notes) lines.push(`- Notes: ${c.notes}`);
      if (c.linkedinUrl) lines.push(`- LinkedIn: ${c.linkedinUrl}`);
      lines.push('');
    });

    onSendMessage(lines.join('\n'));
  };

  if (candidates.length === 0) {
    return (
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-800 bg-gray-900/40">
        No candidates in the pipeline yet. Use <span className="font-semibold text-gray-300">“Add to pipeline”</span> on AI-suggested candidates, or paste real profiles for Nexus to score.
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/40 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
          Pipeline ({candidates.length})
        </h3>
        <div className="flex items-center gap-2">
          {onSendMessage && (
            <button
              type="button"
              onClick={handleCompareSelected}
              disabled={selectedIds.length < 2 || selectedIds.length > 3}
              className="text-[11px] px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-60"
              title="Select 2–3 candidates below, then compare"
            >
              Compare selected ({selectedIds.length || 0})
            </button>
          )}
          <button
            type="button"
            onClick={handleCopyShortlist}
            disabled={isCopyingShortlist}
            className="text-[11px] px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-60"
          >
            {isCopyingShortlist ? 'Copied…' : 'Copy shortlist'}
          </button>
          <button
            type="button"
            onClick={handleCopyPanelBrief}
            disabled={isCopyingPanel}
            className="text-[11px] px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-60"
          >
            {isCopyingPanel ? 'Copied…' : 'Copy panel brief'}
          </button>
          <button
            type="button"
            onClick={handleCopyOfferSummary}
            disabled={isCopyingOffer}
            className="text-[11px] px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-60"
          >
            {isCopyingOffer ? 'Copied…' : 'Copy offer summary'}
          </button>
        </div>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {candidates.map((c: Candidate) => {
          const key = c.id || c.name;
          const isSelected = selectedIds.includes(key);
          return (
            <div key={key} className="border border-gray-700/70 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-gray-900/90 px-3 py-2">
                <CandidateCard candidate={c} />
                {onSendMessage && (
                  <label className="ml-2 flex items-center gap-1 text-[11px] text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-3 w-3"
                      checked={isSelected}
                      onChange={() => toggleSelected(key)}
                    />
                    <span>Select</span>
                  </label>
                )}
              </div>
              <div className="bg-gray-900/70 px-3 py-2 space-y-2 text-[11px] text-gray-300">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-400">Status</span>
                  <select
                    className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-[11px] text-gray-200"
                    value={c.status || CandidateStatus.SOURCED}
                    onChange={(e) => handleStatusChange(c.id, e.target.value as CandidateStatus)}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400">LinkedIn URL</label>
                  <input
                    className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-[11px] text-gray-200"
                    value={c.linkedinUrl || ''}
                    onChange={(e) => handleFieldChange(c.id, 'linkedinUrl', e.target.value)}
                    placeholder="https://www.linkedin.com/in/..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400">Notes / profile text</label>
                  <textarea
                    className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-[11px] text-gray-200"
                    rows={2}
                    value={c.notes || ''}
                    onChange={(e) => handleFieldChange(c.id, 'notes', e.target.value)}
                    placeholder="Paste CV/profile snippets or internal notes"
                  />
                </div>
                {onSendMessage && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md bg-blue-600 text-white text-[11px] hover:bg-blue-500"
                      onClick={() =>
                        onSendMessage(
                          `Please review this candidate for the role "${role.title || 'role'}". ` +
                            `Candidate: ${c.name}. Current role: ${c.currentRole || 'n/a'}. ` +
                            `Summary: ${c.summary}. Notes/CV text: ${
                              c.notes || 'no additional text provided'
                            }. ` +
                            `Score their fit, highlight strengths, risks, and recommend next steps.`
                        )
                      }
                    >
                      Ask Nexus to review
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelinePanel;

