// FIX: Removed `import { Message } from ".";` which caused an error.
// The `Message` interface is defined within this file, so it does not need to be imported.

export enum MessageSender {
  USER = 'USER',
  NEXUS = 'NEXUS',
}

export enum CandidateStatus {
  IDEA = 'IDEA', // AI-suggested, not yet confirmed
  SOURCED = 'SOURCED',
  CONTACTED = 'CONTACTED',
  RESPONDED = 'RESPONDED',
  SCREENED = 'SCREENED',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
}

export interface RecruitmentPhase {
  id: string;
  title: string;
  description: string;
}

export interface Role {
  id: string;
  title: string;
  createdAt?: string;
  level?: string;
  location?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  mustHaveSkills?: string[];
  niceToHaveSkills?: string[];
  responsibilities?: string;
  hiringUrgency?: string;
  notes?: string;
  candidates: Candidate[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export interface Playbook {
  id: string;
  title: string;
  phaseId?: string;
  prompt: string;
}

export interface Reminder {
  id: string;
  roleId: string;
  phaseId?: string;
  text: string;
  dueDate?: string;
  done: boolean;
}

export interface Candidate {
  name: string;
  match: number;
  summary: string;
  currentRole?: string;
  yearsOfExperience?: number;
  linkedinUrl?: string;
  id?: string;
  status?: CandidateStatus;
  email?: string;
  source?: string;
  notes?: string;
  skills?: string[];
  experience?: string;
  workHistory?: { role: string; company: string; duration: string }[];
}
