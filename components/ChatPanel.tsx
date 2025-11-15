import React, { useRef, useEffect } from 'react';
import type { Message, RecruitmentPhase, Role, Candidate, Playbook } from '../types';
import { MessageSender } from '../types';
import { RECRUITMENT_PHASES } from '../constants';
import PhaseSelector from './PhaseSelector';
import MessageBubble from './MessageBubble';
import LoadingBubble from './LoadingBubble';
import InputBar from './InputBar';
import RoleSummary from './RoleSummary';
import PipelinePanel from './PipelinePanel';
import PhaseActionsBar from './PhaseActionsBar';
import RoleImportPanel from './RoleImportPanel';
import RemindersPanel from './RemindersPanel';

interface ChatPanelProps {
  activeRole: Role | null;
  onUpdateRole: (role: Role) => void;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  onAddCandidateToPipeline?: (candidate: Candidate) => void;
  activePhaseId: string;
  setActivePhaseId: (id: string) => void;
  activePhaseInfo: RecruitmentPhase | undefined;
  playbooks: Playbook[];
  onSavePlaybook: (prompt: string) => void;
  reminders: import('../types').Reminder[];
  onAddReminder: (text: string, phaseId?: string, dueDate?: string) => void;
  onToggleReminderDone: (id: string) => void;
  onStopStreaming: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  activeRole,
  onUpdateRole,
  messages,
  isLoading,
  error,
  onSendMessage,
  onEditMessage,
  onAddCandidateToPipeline,
  activePhaseId,
  setActivePhaseId,
  activePhaseInfo,
  playbooks,
  onSavePlaybook,
  reminders,
  onAddReminder,
  onToggleReminderDone,
  onStopStreaming,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handlePhaseChange = (newPhaseId: string) => {
    if (isLoading || newPhaseId === activePhaseId) {
      return;
    }

    setActivePhaseId(newPhaseId);

    const phase = RECRUITMENT_PHASES.find(p => p.id === newPhaseId);
    if (phase) {
      const message = `Let's switch context. I now want to focus on ${phase.title}.`;
      onSendMessage(message);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-start justify-between gap-4 shadow-md z-10">
        <div className="text-left max-w-md">
          <h2 className="text-sm font-semibold text-gray-200">{activePhaseInfo?.title}</h2>
          <p className="text-xs text-gray-400">{activePhaseInfo?.description}</p>
        </div>
        <RoleSummary role={activeRole} onUpdateRole={onUpdateRole} />
      </header>

      <div className="flex flex-col flex-1 overflow-hidden">
        <PhaseSelector
          activePhaseId={activePhaseId}
          onPhaseChange={handlePhaseChange}
          isLoading={isLoading}
        />

        <PhaseActionsBar
          activePhase={activePhaseInfo}
          activeRole={activeRole}
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          playbooks={playbooks}
        />

        {activePhaseId === 'phase0' && (
          <RoleImportPanel
            role={activeRole}
            onUpdateRole={onUpdateRole}
            onSendMessage={onSendMessage}
          />
        )}

        <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              onEditMessage={msg.sender === MessageSender.USER ? onEditMessage : undefined}
              onAddCandidate={msg.sender === MessageSender.NEXUS ? onAddCandidateToPipeline : undefined}
            />
          ))}
          {isLoading && <LoadingBubble />}
              {error && (
            <div className="text-center text-red-400 text-sm p-4 bg-red-900/50 rounded-lg">
              {error}
            </div>
          )}
        </main>

        <PipelinePanel role={activeRole} onUpdateRole={onUpdateRole} onSendMessage={onSendMessage} />

        <RemindersPanel
          role={activeRole}
          reminders={reminders}
          activePhaseId={activePhaseId}
          onAddReminder={onAddReminder}
          onToggleDone={onToggleReminderDone}
        />

        <InputBar
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          onSavePlaybook={onSavePlaybook}
          onStop={onStopStreaming}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
