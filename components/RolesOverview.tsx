import React from 'react';
import type { Role, Candidate, Reminder } from '../types';
import { CandidateStatus } from '../types';

interface RolesOverviewProps {
  roles: Role[];
  reminders: Reminder[];
  onSelectRole: (id: string) => void;
  onOpenRoleWorkspace: (id: string) => void;
  onNewRole: () => void;
}

const computeCounts = (role: Role) => {
  const candidates = role.candidates || [];
  const total = candidates.length;
  const byStatus: Partial<Record<CandidateStatus, number>> = {};
  candidates.forEach((c: Candidate) => {
    const s = c.status || CandidateStatus.SOURCED;
    byStatus[s] = (byStatus[s] || 0) + 1;
  });
  const activeCount =
    (byStatus[CandidateStatus.SCREENED] || 0) +
    (byStatus[CandidateStatus.INTERVIEW] || 0) +
    (byStatus[CandidateStatus.OFFER] || 0);
  const hiredCount = byStatus[CandidateStatus.HIRED] || 0;
  return { total, byStatus, activeCount, hiredCount };
};

const computeDaysOpen = (role: Role): number | null => {
  if (!role.createdAt) return null;
  const created = new Date(role.createdAt).getTime();
  if (Number.isNaN(created)) return null;
  const diffMs = Date.now() - created;
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
};

const computeRiskLabel = (
  total: number,
  activeCount: number,
  byStatus: Partial<Record<CandidateStatus, number>>
): string | null => {
  const offers = byStatus[CandidateStatus.OFFER] || 0;
  const hired = byStatus[CandidateStatus.HIRED] || 0;

  if (total === 0) return 'No candidates in pipeline';
  if (activeCount < 3 && total > 0) return 'Shortlist under 3 candidates';
  if (offers > 0 && hired === 0) return 'Offer decision pending';

  return null;
};

const RolesOverview: React.FC<RolesOverviewProps> = ({
  roles,
  reminders,
  onSelectRole,
  onOpenRoleWorkspace,
  onNewRole,
}) => {
  const now = Date.now();
  const overdueReminders = reminders
    .filter((r) => !r.done && r.dueDate && new Date(r.dueDate).getTime() < now)
    .slice(0, 3);

  const rolesNeedingSourcing = roles
    .map((role) => ({ role, counts: computeCounts(role) }))
    .filter(({ counts }) => counts.total === 0 || counts.activeCount < 3)
    .slice(0, 3);

  const rolesWithOffers = roles
    .map((role) => ({ role, counts: computeCounts(role) }))
    .filter(({ counts }) => (counts.byStatus[CandidateStatus.OFFER] || 0) > 0)
    .slice(0, 3);

  const hasAgenda =
    overdueReminders.length > 0 ||
    rolesNeedingSourcing.length > 0 ||
    rolesWithOffers.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/70">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">Today</h1>
          <p className="text-xs text-gray-400">
            High-impact actions and a quick overview across all roles.
          </p>
        </div>
        <button
          onClick={onNewRole}
          className="px-3 py-1.5 rounded-md bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
        >
          New role
        </button>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {hasAgenda && (
          <section className="border border-gray-800 rounded-lg bg-gray-900/70 p-4 space-y-2">
            <h2 className="text-sm font-semibold text-gray-100">
              Today’s high-impact actions
            </h2>
            <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
              {overdueReminders.map((r) => {
                const role = roles.find((role) => role.id === r.roleId);
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (role) {
                          onSelectRole(role.id);
                          onOpenRoleWorkspace(role.id);
                        }
                      }}
                      className="text-left hover:text-blue-300"
                    >
                      Follow up: {r.text}
                      {role && ` — ${role.title || 'Untitled role'}`}
                    </button>
                  </li>
                );
              })}
              {rolesNeedingSourcing.map(({ role }) => (
                <li key={`${role.id}-sourcing`}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRole(role.id);
                      onOpenRoleWorkspace(role.id);
                    }}
                    className="text-left hover:text-blue-300"
                  >
                    Source more candidates for {role.title || 'this role'}.
                  </button>{' '}
                  <span className="text-gray-500">
                    (Use a Phase 1 sourcing prompt or ask Nexus to draft outreach.)
                  </span>
                </li>
              ))}
              {rolesWithOffers.map(({ role }) => (
                <li key={`${role.id}-offers`}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRole(role.id);
                      onOpenRoleWorkspace(role.id);
                    }}
                    className="text-left hover:text-blue-300"
                  >
                    Decide on open offers for {role.title || 'this role'}.
                  </button>{' '}
                  <span className="text-gray-500">
                    (Ask Nexus for an offer recommendation summary.)
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {roles.length === 0 && (
          <div className="text-sm text-gray-500">
            No roles yet. Click <span className="font-semibold text-gray-200">New role</span> to get started.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const { total, byStatus, activeCount, hiredCount } = computeCounts(role);
            const daysOpen = computeDaysOpen(role);
            const risk = computeRiskLabel(total, activeCount, byStatus);

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  onSelectRole(role.id);
                  onOpenRoleWorkspace(role.id);
                }}
                className="text-left bg-gray-900/70 border border-gray-800 rounded-lg p-4 hover:border-blue-500 transition-colors flex flex-col gap-2"
              >
                <div>
                  <h2 className="text-sm font-semibold text-gray-100 truncate">
                    {role.title || 'Untitled role'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {[role.level, role.location].filter(Boolean).join(' · ') || 'Details not set'}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>
                    {daysOpen !== null ? `Open ${daysOpen} day${daysOpen === 1 ? '' : 's'}` : 'Open: n/a'}
                  </span>
                  {risk && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-900/40 border border-amber-700 text-amber-200">
                      At risk: {risk}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-300">
                  <span className="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700">
                    {total} candidates
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700">
                    {activeCount} in process
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700">
                    {hiredCount} hired
                  </span>
                </div>
                {role.responsibilities && (
                  <p className="mt-1 text-[11px] text-gray-400 line-clamp-3">
                    {role.responsibilities}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RolesOverview;

