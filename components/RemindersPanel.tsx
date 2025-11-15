import React, { useState } from 'react';
import type { Reminder, Role } from '../types';

interface RemindersPanelProps {
  role: Role | null;
  reminders: Reminder[];
  activePhaseId: string;
  onAddReminder: (text: string, phaseId?: string, dueDate?: string) => void;
  onToggleDone: (id: string) => void;
}

const RemindersPanel: React.FC<RemindersPanelProps> = ({
  role,
  reminders,
  activePhaseId,
  onAddReminder,
  onToggleDone,
}) => {
  const [input, setInput] = useState('');
  const [dueInDays, setDueInDays] = useState<string>('3');

  if (!role) return null;

  const roleReminders = reminders.filter((r) => r.roleId === role.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let dueDate: string | undefined;
    const days = parseInt(dueInDays, 10);
    if (!Number.isNaN(days) && days > 0) {
      const ms = days * 24 * 60 * 60 * 1000;
      dueDate = new Date(Date.now() + ms).toISOString();
    }

    onAddReminder(input.trim(), activePhaseId, dueDate);
    setInput('');
  };

  const describeDue = (reminder: Reminder): string | null => {
    if (!reminder.dueDate) return null;
    const now = Date.now();
    const due = new Date(reminder.dueDate).getTime();
    const diffMs = due - now;
    const days = Math.round(diffMs / (24 * 60 * 60 * 1000));

    if (reminder.done) return 'Completed';
    if (diffMs < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due in 1 day';
    return `Due in ${days} days`;
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900/60 px-4 py-2 text-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-200">Reminders</span>
      </div>
      <div className="max-h-28 overflow-y-auto space-y-1 mb-2">
        {roleReminders.length === 0 && (
          <p className="text-gray-500">No reminders yet for this role.</p>
        )}
        {roleReminders.map((r) => {
          const dueText = describeDue(r);
          const isOverdue = dueText === 'Overdue';
          return (
            <label
              key={r.id}
              className="flex items-start justify-between gap-2 text-gray-300 cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 h-3 w-3"
                  checked={r.done}
                  onChange={() => onToggleDone(r.id)}
                />
                <span className={r.done ? 'line-through text-gray-500' : ''}>
                  {r.text}
                </span>
              </div>
              {dueText && (
                <span
                  className={`ml-2 text-[10px] whitespace-nowrap ${
                    isOverdue ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {dueText}
                </span>
              )}
            </label>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-[11px] text-gray-200"
          placeholder="Follow up with X"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <select
          className="bg-gray-800 border border-gray-700 rounded-md px-1.5 py-1 text-[11px] text-gray-200"
          value={dueInDays}
          onChange={(e) => setDueInDays(e.target.value)}
        >
          <option value="">No due</option>
          <option value="1">1d</option>
          <option value="3">3d</option>
          <option value="7">7d</option>
        </select>
        <button
          type="submit"
          className="px-2 py-1 rounded-md bg-gray-700 text-gray-100 text-[11px] hover:bg-gray-600"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default RemindersPanel;
