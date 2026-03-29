import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'student' | 'employer' | 'coordinator';

export type ApplicationStatus = 
  | 'No Application' | 'Applied' | 'Provisionally Accepted' 
  | 'Provisionally Rejected' | 'Finally Accepted' | 'Finally Rejected' 
  | 'Placement Rejected' | 'Dismissed' | 'Flagged for Review';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  name?: string;
  studentId?: string;
  company?: string;
}

export interface Notification {
  id: string;
  userId: string; // Target user
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  createdAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  applicationId: string;
  studentId: string;
  status: ApplicationStatus;
  timestamp: string;
  coordinatorId: string;
  reason?: string;
}

export interface Placement {
  id: string;
  studentId: string;
  studentName: string;
  employerName: string;
  position: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Rejected' | 'Dismissed';
  rejectionReason?: string;
  rejectionDate?: string;
}

export interface EvaluationForm {
  pdfUrl: any;
  id: string;
  employerId: string;
  studentName: string;
  workTerm: string;
  behaviour: number;
  skills: number;
  knowledge: number;
  attitude: number;
  comments: string;
  submittedAt: string;
  pdfFile?: string;
}

export interface WorkTermReport {
  id: string;
  studentId: string;
  employerName: string;
  position: string;
  workTerm: string;
  startDate: string;
  endDate: string;
  fileName: string;
  submittedAt: string;
}

export interface Evaluation {
  id: string;
  employerId: string;
  studentName: string;
  workTerm: string;
  behaviour: number;
  skills: number;
  knowledge: number;
  attitude: number;
  comments: string;
  submittedAt: string;
}

export interface Placement {
  id: string;
  studentName: string;
  employerName: string;
  position: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Dismissed' | 'rejected';
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  status: ApplicationStatus;
  history: any[];
  userId: string;
}

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  applications: Application[];
  reports: Report[];
  evaluations: Evaluation[];
  placements: Placement[];
  notifications: Notification[];
  login: (user: User) => void;
  logout: () => void;
  setApplications: (apps: Application[]) => void;
  setPlacements: (placements: Placement[]) => void;
  addReport: (report: Omit<Report, 'id'>) => void;
  addEvaluation: (evaluation: Omit<Evaluation, 'id'>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  updateApplicationStatus: (appId: string, status: ApplicationStatus, coordId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      applications: [],
      reports: [],
      evaluations: [], 
      placements: [],
      notifications: [],

      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      setApplications: (apps) => set({ applications: apps }),
      setPlacements: (placements) => set({ placements }),

      addReport: (reportData) => set((state) => ({
        reports: [{ ...reportData, id: Math.random().toString(36).substr(2, 9) }, ...state.reports]
      })),

      addEvaluation: (evalData) => set((state) => ({
        evaluations: [{ ...evalData, id: Math.random().toString(36).substr(2, 9) }, ...state.evaluations]
      })),

      addNotification: (notifData) => set((state) => ({
        notifications: [
          { 
            ...notifData, 
            id: Math.random().toString(36).substr(2, 9), 
            createdAt: new Date().toISOString(),
            read: false 
          }, 
          ...state.notifications
        ]
      })),

      updateApplicationStatus: (appId, status) => set((state) => ({
        applications: state.applications.map(a => a.id === appId ? { ...a, status } : a)
      })),
    }),
    { name: 'app-storage' }
  )
);