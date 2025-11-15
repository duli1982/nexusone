import React, { useState } from 'react';
import type { Role } from '../types';

interface RoleSummaryProps {
  role: Role | null;
  onUpdateRole: (role: Role) => void;
}

const RoleSummary: React.FC<RoleSummaryProps> = ({ role, onUpdateRole }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!role) {
    return (
      <div className="text-right text-xs text-gray-500">
        No role selected. Create a role to unlock structured assistance.
      </div>
    );
  }

  const handleChange = (field: keyof Role, value: string) => {
    const numericFields: (keyof Role)[] = ['salaryMin', 'salaryMax'];
    let updated: Role = { ...role };
    if (numericFields.includes(field)) {
      const num = value === '' ? undefined : Number(value);
      (updated as any)[field] = isNaN(num as number) ? undefined : num;
    } else if (field === 'mustHaveSkills' || field === 'niceToHaveSkills') {
      (updated as any)[field] = value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    } else {
      (updated as any)[field] = value;
    }
    onUpdateRole(updated);
  };

  if (!isEditing) {
    const musts = role.mustHaveSkills && role.mustHaveSkills.length > 0 ? role.mustHaveSkills.join(', ') : '—';
    const nice = role.niceToHaveSkills && role.niceToHaveSkills.length > 0 ? role.niceToHaveSkills.join(', ') : '—';
    const salary =
      role.salaryMin || role.salaryMax
        ? `${role.currency || ''} ${role.salaryMin ?? '?'} - ${role.salaryMax ?? '?'}`
        : 'Not set';

    return (
      <div className="text-right text-xs text-gray-300 space-y-1">
        <div className="flex items-center justify-end gap-2">
          <div>
            <div className="font-semibold text-sm text-gray-100 truncate max-w-xs">
              {role.title || 'Untitled role'}
            </div>
            <div className="text-gray-400">
              {[role.level, role.location].filter(Boolean).join(' • ') || 'Role details not set'}
            </div>
          </div>
          <button
            className="px-2 py-1 rounded-md border border-gray-600 text-[11px] text-gray-200 hover:bg-gray-700"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        </div>
        <div className="text-gray-400">
          <span className="font-semibold text-gray-300">Salary:</span> {salary}
        </div>
        <div className="text-gray-400">
          <span className="font-semibold text-gray-300">Must-haves:</span> {musts}
        </div>
        <div className="text-gray-400">
          <span className="font-semibold text-gray-300">Nice-to-haves:</span> {nice}
        </div>
      </div>
    );
  }

  const mustsValue = (role.mustHaveSkills || []).join(', ');
  const niceValue = (role.niceToHaveSkills || []).join(', ');

  return (
    <div className="text-xs text-gray-200 space-y-2 w-full max-w-lg ml-auto">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-100">Role setup</span>
        <div className="space-x-2">
          <button
            className="px-2 py-1 rounded-md border border-gray-600 text-[11px] text-gray-200 hover:bg-gray-700"
            onClick={() => setIsEditing(false)}
          >
            Done
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200"
          placeholder="Role title (e.g., Senior Backend Engineer)"
          value={role.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
        <input
          className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200"
          placeholder="Level (e.g., Senior, Lead)"
          value={role.level || ''}
          onChange={(e) => handleChange('level', e.target.value)}
        />
        <input
          className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200"
          placeholder="Location"
          value={role.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
        />
        <input
          className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200"
          placeholder="Employment type (e.g., Full-time)"
          value={role.employmentType || ''}
          onChange={(e) => handleChange('employmentType', e.target.value)}
        />
        <input
          className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200"
          placeholder="Currency (e.g., USD, EUR)"
          value={role.currency || ''}
          onChange={(e) => handleChange('currency', e.target.value)}
        />
        <div className="flex gap-2">
          <input
            className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200 w-1/2"
            placeholder="Min salary"
            value={role.salaryMin?.toString() || ''}
            onChange={(e) => handleChange('salaryMin', e.target.value)}
          />
          <input
            className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200 w-1/2"
            placeholder="Max salary"
            value={role.salaryMax?.toString() || ''}
            onChange={(e) => handleChange('salaryMax', e.target.value)}
          />
        </div>
        <input
          className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200 col-span-2"
          placeholder="Must-have skills (comma-separated)"
          value={mustsValue}
          onChange={(e) => handleChange('mustHaveSkills', e.target.value)}
        />
        <input
          className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200 col-span-2"
          placeholder="Nice-to-have skills (comma-separated)"
          value={niceValue}
          onChange={(e) => handleChange('niceToHaveSkills', e.target.value)}
        />
      </div>
      <textarea
        className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-200 w-full"
        rows={2}
        placeholder="Responsibilities / notes"
        value={role.responsibilities || ''}
        onChange={(e) => handleChange('responsibilities', e.target.value)}
      />
    </div>
  );
};

export default RoleSummary;

