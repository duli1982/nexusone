import React, { useState, useEffect, useRef } from 'react';
import type { Chat, Content } from '@google/genai';
import { RECRUITMENT_PHASES } from './constants';
import { createNexusChat } from './services/geminiService';
import type { Message, ChatSession, Role, Candidate, Playbook, Reminder } from './types';
import { MessageSender, CandidateStatus } from './types';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import RolesOverview from './components/RolesOverview';

const mapMessagesToGeminiHistory = (messages: Message[]): Content[] => {
  return messages.map(msg => ({
    role: msg.sender === MessageSender.USER ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));
};

const App: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhaseId, setActivePhaseId] = useState<string>(RECRUITMENT_PHASES[0].id);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showRolesOverview, setShowRolesOverview] = useState<boolean>(false);
  
  const chatInstances = useRef(new Map<string, Chat>());

  // --- Persistence helpers ---
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('nexus-talent-os-state');
      if (raw) {
        const parsed = JSON.parse(raw) as {
          roles?: Role[];
          chats?: ChatSession[];
          activeRoleId?: string | null;
          activeChatId?: string | null;
          activePhaseId?: string;
          playbooks?: Playbook[];
          reminders?: Reminder[];
          showRolesOverview?: boolean;
        };
        if (parsed.roles && parsed.roles.length > 0) {
          setRoles(parsed.roles);
          setChats(parsed.chats || []);
          setActiveRoleId(parsed.activeRoleId ?? parsed.roles[0].id);
          setActiveChatId(parsed.activeChatId ?? null);
          if (parsed.activePhaseId) {
            setActivePhaseId(parsed.activePhaseId);
          }
          if (parsed.playbooks) setPlaybooks(parsed.playbooks);
          if (parsed.reminders) setReminders(parsed.reminders);
          if (typeof parsed.showRolesOverview === 'boolean') {
            setShowRolesOverview(parsed.showRolesOverview);
          }
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
    // If no saved state, create an initial role and chat
    handleCreateInitialRoleAndChat();
  }, []);

  useEffect(() => {
    try {
      const snapshot = {
        roles,
        chats,
        activeRoleId,
        activeChatId,
        activePhaseId,
        playbooks,
        reminders,
        showRolesOverview,
      };
      window.localStorage.setItem('nexus-talent-os-state', JSON.stringify(snapshot));
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  }, [roles, chats, activeRoleId, activeChatId, activePhaseId, playbooks, reminders, showRolesOverview]);

  const handleCreateInitialRoleAndChat = () => {
    const defaultRoleId = `role_${Date.now()}`;
    const defaultRole: Role = {
      id: defaultRoleId,
      title: 'New Role',
      createdAt: new Date().toISOString(),
      location: '',
      employmentType: '',
      candidates: [],
    };
    setRoles([defaultRole]);
    setActiveRoleId(defaultRoleId);
    handleNewChat(defaultRoleId, true);
  };

  const handleNewRole = () => {
    if (isLoading) return;
    const newRoleId = `role_${Date.now()}`;
    const newRole: Role = {
      id: newRoleId,
      title: 'New Role',
      createdAt: new Date().toISOString(),
      location: '',
      employmentType: '',
      candidates: [],
    };
    setRoles(prev => [newRole, ...prev]);
    setActiveRoleId(newRoleId);
    handleNewChat(newRoleId, true);
  };

  const handleUpdateRole = (updatedRole: Role) => {
    setRoles(prev => prev.map(r => (r.id === updatedRole.id ? updatedRole : r)));
  };

  const handleNewChat = (roleId?: string, isInitial?: boolean) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const targetRoleId = roleId || activeRoleId;
    if (!targetRoleId) {
      setError('No active role selected. Please create a role first.');
      setIsLoading(false);
      return;
    }
    
    const newChatInstance = createNexusChat();
    if (!newChatInstance) {
      setError("Failed to initialize AI assistant. Please check your API key and refresh the page.");
      setIsLoading(false);
      return;
    }

    const newChatId = `chat_${Date.now()}`;
    chatInstances.current.set(newChatId, newChatInstance);

    const newChatSession: ChatSession = {
      id: newChatId,
      title: "New Conversation",
      // @ts-expect-error: extending shape without breaking existing usage
      roleId: targetRoleId,
      messages: [
        {
          id: `nexus_${Date.now()}`,
          sender: MessageSender.NEXUS,
          text: "Let's begin. What would you like help with today?"
        }
      ]
    };

    setChats(prev => [newChatSession, ...prev]);
    setActiveChatId(newChatId);
    if (!isInitial) {
      setActiveRoleId(targetRoleId);
    }
    setIsLoading(false);
  };

  const handlePhaseTransition = (responseText: string) => {
    const phaseTransitionRegex = /belongs to \*\*Phase (\d+):/;
    const match = responseText.match(phaseTransitionRegex);
    if (match && match[1]) {
      const phaseNumber = match[1];
      const newPhaseId = `phase${phaseNumber}`;
      if (RECRUITMENT_PHASES.some(p => p.id === newPhaseId)) {
        setActivePhaseId(newPhaseId);
      }
    }
  };

  const handleSendMessage = async (userInput: string) => {
    if (!activeChatId || !chatInstances.current.has(activeChatId)) {
      setError("No active chat session. Please start a new chat.");
      return;
    }

    const chatInstance = chatInstances.current.get(activeChatId)!;

    setIsLoading(true);
    setError(null);

    setChats(prevChats => prevChats.map(chat => {
        if (chat.id === activeChatId) {
            const isFirstUserMessage = chat.messages.filter(m => m.sender === MessageSender.USER).length === 0;
            return {
                ...chat,
                title: isFirstUserMessage && userInput.length < 50 ? userInput : chat.title,
                messages: [...chat.messages, { id: `user_${Date.now()}`, sender: MessageSender.USER, text: userInput }]
            };
        }
        return chat;
    }));

    try {
      const stream = await chatInstance.sendMessageStream({ message: userInput });
      
      let fullResponseText = "";
      let firstChunk = true;
      const nexusMessageId = `nexus_${Date.now()}`;

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponseText += chunkText;

        if (firstChunk) {
            setChats(prevChats => prevChats.map(chat => {
                if (chat.id === activeChatId) {
                    return { ...chat, messages: [...chat.messages, { id: nexusMessageId, sender: MessageSender.NEXUS, text: chunkText }] };
                }
                return chat;
            }));
            firstChunk = false;
        } else {
            setChats(prevChats => prevChats.map(chat => {
                if (chat.id === activeChatId) {
                    const newMessages = [...chat.messages];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage?.sender === MessageSender.NEXUS) {
                        lastMessage.text += chunkText;
                    }
                    return { ...chat, messages: newMessages };
                }
                return chat;
            }));
        }
      }

      handlePhaseTransition(fullResponseText);
      
    } catch (e) {
      const error = e instanceof Error ? e : new Error('An unknown error occurred.');
      console.error(error);

      let displayError: string;
      let chatError: string;

      if (!navigator.onLine) {
        displayError = "You appear to be offline. Please check your internet connection.";
        chatError = "It seems we've lost connection. Please check your internet and try again.";
      } else if (error.message.toLowerCase().includes('api key not valid')) {
        displayError = "Invalid API Key. Please check your configuration.";
        chatError = "There seems to be an issue with my connection credentials. Please ask an administrator to check the API key configuration.";
      } else {
        displayError = "An unexpected error occurred. Please try again. If the problem persists, check your network connection or the browser console for details.";
        chatError = "I'm sorry, I ran into a technical problem and couldn't complete your request. Could you please try that again?";
      }

      setError(displayError);
       setChats(prevChats => prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return { ...chat, messages: [...chat.messages, { id: `nexus_err_${Date.now()}`, sender: MessageSender.NEXUS, text: chatError }] };
        }
        return chat;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAndResubmit = async (messageId: string, newText: string) => {
    if (!activeChatId) return;

    setIsLoading(true);
    setError(null);

    const activeChatIndex = chats.findIndex(c => c.id === activeChatId);
    if (activeChatIndex === -1) {
        setIsLoading(false);
        return;
    }

    const activeChatSession = chats[activeChatIndex];
    const messageIndex = activeChatSession.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
        setIsLoading(false);
        return;
    }

    const truncatedMessages = activeChatSession.messages.slice(0, messageIndex + 1);
    truncatedMessages[messageIndex].text = newText;

    const updatedChats = [...chats];
    updatedChats[activeChatIndex] = {
        ...activeChatSession,
        messages: truncatedMessages
    };
    setChats(updatedChats);

    const historyForNewInstance = mapMessagesToGeminiHistory(truncatedMessages.slice(0, -1));

    const newChatInstance = createNexusChat(historyForNewInstance);
    if (!newChatInstance) {
        setError("Failed to re-initialize AI assistant for editing.");
        setIsLoading(false);
        return;
    }
    chatInstances.current.set(activeChatId, newChatInstance);

    try {
      const stream = await newChatInstance.sendMessageStream({ message: newText });
      
      let fullResponseText = "";
      let firstChunk = true;
      const nexusMessageId = `nexus_${Date.now()}`;

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponseText += chunkText;

        if (firstChunk) {
            setChats(prev => prev.map(chat => {
                if (chat.id === activeChatId) {
                    return { ...chat, messages: [...chat.messages, { id: nexusMessageId, sender: MessageSender.NEXUS, text: chunkText }] };
                }
                return chat;
            }));
            firstChunk = false;
        } else {
            setChats(prev => prev.map(chat => {
                if (chat.id === activeChatId) {
                    const newMessages = [...chat.messages];
                    if (newMessages.length > 0 && newMessages[newMessages.length - 1].sender === MessageSender.NEXUS) {
                        newMessages[newMessages.length - 1].text += chunkText;
                    }
                    return { ...chat, messages: newMessages };
                }
                return chat;
            }));
        }
      }
      handlePhaseTransition(fullResponseText);
    } catch (e) {
      const error = e instanceof Error ? e : new Error('An unknown error occurred.');
      console.error(error);
      let displayError = "An unexpected error occurred while editing. Please try again.";
      let chatError = "I'm sorry, I ran into a problem while processing your edit.";
      setError(displayError);
       setChats(prevChats => prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return { ...chat, messages: [...chat.messages, { id: `nexus_err_${Date.now()}`, sender: MessageSender.NEXUS, text: chatError }] };
        }
        return chat;
      }));
    } finally {
      setIsLoading(false);
    }
};

  const handleAddCandidateToPipeline = (candidate: Candidate) => {
    if (!activeRoleId) return;
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role.id !== activeRoleId) return role;
        const newCandidate: Candidate = {
          ...candidate,
          id: candidate.id || `cand_${Date.now()}`,
          status: CandidateStatus.SOURCED,
          source: candidate.source || 'AI suggestion',
        };
        const existing = role.candidates || [];
        // Avoid duplicates by name + currentRole if possible
        const already = existing.find(
          c => c.name === newCandidate.name && c.currentRole === newCandidate.currentRole
        );
        if (already) return role;
        return {
          ...role,
          candidates: [...existing, newCandidate],
        };
      })
    );
  };

  const handleSavePlaybook = (prompt: string) => {
    const id = `pb_${Date.now()}`;
    const titleSource = prompt.split('\n')[0] || prompt;
    const title =
      titleSource.length > 60 ? `${titleSource.slice(0, 57).trimEnd()}…` : titleSource;
    const playbook: Playbook = {
      id,
      title,
      phaseId: activePhaseId,
      prompt,
    };
    setPlaybooks(prev => [playbook, ...prev]);
  };

  const handleAddReminder = (text: string, phaseId?: string, dueDate?: string) => {
    if (!activeRoleId) return;
    const reminder: Reminder = {
      id: `rem_${Date.now()}`,
      roleId: activeRoleId,
      phaseId,
      text,
      dueDate,
      done: false,
    };
    setReminders(prev => [reminder, ...prev]);
  };

  const handleToggleReminderDone = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, done: !r.done } : r))
    );
  };

  const handleOpenRoleWorkspace = (roleId: string) => {
    setActiveRoleId(roleId);
    const roleChats = chats.filter((c: any) => c.roleId === roleId);
    if (roleChats.length > 0) {
      setActiveChatId(roleChats[0].id);
    } else {
      handleNewChat(roleId, true);
    }
    setShowRolesOverview(false);
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeRole = roles.find(r => r.id === activeRoleId) || null;
  const activePhaseInfo = RECRUITMENT_PHASES.find(p => p.id === activePhaseId);

  return (
    <div className="h-screen w-screen flex bg-gray-900 text-gray-200 font-sans">
      <Sidebar
        roles={roles}
        activeRoleId={activeRoleId}
        onSelectRole={(id) => !isLoading && setActiveRoleId(id)}
        showRolesOverview={showRolesOverview}
        onToggleRolesOverview={() => setShowRolesOverview(prev => !prev)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => !isLoading && setActiveChatId(id)}
        onNewChat={() => handleNewChat()}
        onNewRole={handleNewRole}
        isLoading={isLoading}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {showRolesOverview ? (
          <RolesOverview
            roles={roles}
            reminders={reminders}
            onSelectRole={(id) => setActiveRoleId(id)}
            onOpenRoleWorkspace={handleOpenRoleWorkspace}
            onNewRole={handleNewRole}
          />
        ) : activeChat ? (
            <ChatPanel
                activeRole={activeRole}
                onUpdateRole={handleUpdateRole}
                messages={activeChat.messages}
                isLoading={isLoading}
                error={error}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditAndResubmit}
                onAddCandidateToPipeline={handleAddCandidateToPipeline}
                activePhaseId={activePhaseId}
                setActivePhaseId={setActivePhaseId}
                activePhaseInfo={activePhaseInfo}
                playbooks={playbooks}
                onSavePlaybook={handleSavePlaybook}
                reminders={reminders}
                onAddReminder={handleAddReminder}
                onToggleReminderDone={handleToggleReminderDone}
            />
        ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a chat or start a new one to begin.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
