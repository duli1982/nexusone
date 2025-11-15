import React, { useState } from 'react';
import type { Role } from '../types';

interface RoleImportPanelProps {
  role: Role | null;
  onUpdateRole: (role: Role) => void;
  onSendMessage: (prompt: string) => void;
}

const RoleImportPanel: React.FC<RoleImportPanelProps> = ({
  role,
  onUpdateRole,
  onSendMessage,
}) => {
  const [jdText, setJdText] = useState('');

  if (!role) return null;

  const handleApplyJd = () => {
    if (!jdText.trim()) return;
    const updated: Role = {
      ...role,
      responsibilities: jdText,
    };
    onUpdateRole(updated);
    onSendMessage(
      `I have a job description for the role "${role.title || 'role'}". ` +
        `Please structure it into clear sections (Overview, Responsibilities, Requirements, Nice-to-haves) ` +
        `and suggest any improvements or missing elements.\n\n` +
        jdText
    );
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900/40 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
          Role input (JD)
        </span>
        <span className="text-[11px] text-gray-400">
          Paste an existing JD and let Nexus refine it.
        </span>
      </div>
      <textarea
        className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200"
        rows={3}
        placeholder="Paste a job description here to let Nexus structure and improve it."
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleApplyJd}
          disabled={!jdText.trim()}
          className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-60"
        >
          Apply JD & ask Nexus
        </button>
      </div>
    </div>
  );
};

export default RoleImportPanel;

