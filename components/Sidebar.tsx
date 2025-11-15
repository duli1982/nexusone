import React from 'react';
import type { ChatSession, Role } from '../types';
import { NexusIcon, PlusIcon } from './Icons';

interface SidebarProps {
  roles: Role[];
  activeRoleId: string | null;
  onSelectRole: (id: string) => void;
  showRolesOverview?: boolean;
  onToggleRolesOverview?: () => void;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onNewRole: () => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  roles,
  activeRoleId,
  onSelectRole,
  showRolesOverview,
  onToggleRolesOverview,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onNewRole,
  isLoading,
}) => {
  const filteredChats = activeRoleId
    ? chats.filter((chat: any) => chat.roleId === activeRoleId)
    : chats;

  return (
    <aside className="w-72 bg-gray-900 flex flex-col border-r border-gray-800 flex-shrink-0">
      <div className="p-4 border-b border-gray-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Active Role</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={activeRoleId || ''}
              onChange={(e) => onSelectRole(e.target.value)}
              disabled={isLoading || roles.length === 0}
            >
              {roles.length === 0 && <option value="">No roles yet</option>}
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title || 'Untitled role'}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onNewRole}
            disabled={isLoading}
            className="flex-shrink-0 p-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
            title="Create new role"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onNewChat}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          New Chat
        </button>
        {onToggleRolesOverview && (
          <button
            type="button"
            onClick={onToggleRolesOverview}
            className={`w-full text-xs mt-1 py-1.5 rounded-md border ${
              showRolesOverview
                ? 'border-gray-500 text-gray-100 bg-gray-800'
                : 'border-gray-700 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {showRolesOverview ? 'Hide Today view' : 'Show Today view'}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full text-left p-2 rounded-md text-sm truncate transition-colors duration-150 ${
                chat.id === activeChatId
                  ? 'bg-gray-700 text-white font-semibold'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {chat.title}
            </button>
          ))}
        </nav>
      </div>
       <div className="p-4 border-t border-gray-800 flex items-center space-x-3">
          <NexusIcon className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold text-gray-100">Nexus</h1>
            <p className="text-xs text-gray-500">Talent OS Assistant</p>
          </div>
        </div>
    </aside>
  );
};

export default Sidebar;
