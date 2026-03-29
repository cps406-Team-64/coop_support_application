// Mock data store for the prototype - simulates backend
import { create } from 'zustand';

export type UserRole = 'student' | 'employer' | 'coordinator';

export type ApplicationStatus = 'No Application' | 'Applied' | 'Provisionally Accepted' | 'Provisionally Rejected' | 'Finally Accepted' | 'Finally Rejected' | 'Placement Rejected' | 'Dismissed' | 'Flagged for Review';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  studentId?: string;
  passwordSetup?: boolean;
}

export interface Application {
  id: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  status: ApplicationStatus;
  createdAt: string;
  history: StatusHistoryEntry[];
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

export interface Notification {
  id: string;
  senderId: string;
  recipientIds: string[];
  subject: string;
  message: string;
  timestamp: string;
}

// Mock data
const mockApplications: Application[] = [
  {
    id: 'APP-001', studentName: 'Alice Johnson', studentId: 'STU-10001', studentEmail: 'alice.johnson@university.edu',
    status: 'Finally Accepted', createdAt: '2025-09-01T10:00:00Z',
    history: [
      { id: 'H1', applicationId: 'APP-001', studentId: 'STU-10001', status: 'Applied', timestamp: '2025-09-01T10:00:00Z', coordinatorId: 'system' },
      { id: 'H2', applicationId: 'APP-001', studentId: 'STU-10001', status: 'Provisionally Accepted', timestamp: '2025-09-05T14:00:00Z', coordinatorId: 'COORD-001' },
      { id: 'H3', applicationId: 'APP-001', studentId: 'STU-10001', status: 'Finally Accepted', timestamp: '2025-09-10T09:00:00Z', coordinatorId: 'COORD-001' },
    ],
  },
  {
    id: 'APP-002', studentName: 'Bob Smith', studentId: 'STU-10002', studentEmail: 'bob.smith@university.edu',
    status: 'Applied', createdAt: '2025-10-15T08:30:00Z',
    history: [
      { id: 'H4', applicationId: 'APP-002', studentId: 'STU-10002', status: 'Applied', timestamp: '2025-10-15T08:30:00Z', coordinatorId: 'system' },
    ],
  },
  {
    id: 'APP-003', studentName: 'Carol Davis', studentId: 'STU-10003', studentEmail: 'carol.davis@university.edu',
    status: 'Flagged for Review', createdAt: '2025-08-20T11:00:00Z',
    history: [
      { id: 'H5', applicationId: 'APP-003', studentId: 'STU-10003', status: 'Applied', timestamp: '2025-08-20T11:00:00Z', coordinatorId: 'system' },
      { id: 'H6', applicationId: 'APP-003', studentId: 'STU-10003', status: 'Finally Accepted', timestamp: '2025-08-25T10:00:00Z', coordinatorId: 'COORD-001' },
      { id: 'H7', applicationId: 'APP-003', studentId: 'STU-10003', status: 'Dismissed', timestamp: '2025-11-01T16:00:00Z', coordinatorId: 'COORD-002', reason: 'Performance issues' },
      { id: 'H8', applicationId: 'APP-003', studentId: 'STU-10003', status: 'Flagged for Review', timestamp: '2025-11-01T16:01:00Z', coordinatorId: 'system' },
    ],
  },
  {
    id: 'APP-004', studentName: 'David Lee', studentId: 'STU-10004', studentEmail: 'david.lee@university.edu',
    status: 'Provisionally Accepted', createdAt: '2025-10-01T09:00:00Z',
    history: [
      { id: 'H9', applicationId: 'APP-004', studentId: 'STU-10004', status: 'Applied', timestamp: '2025-10-01T09:00:00Z', coordinatorId: 'system' },
      { id: 'H10', applicationId: 'APP-004', studentId: 'STU-10004', status: 'Provisionally Accepted', timestamp: '2025-10-05T14:00:00Z', coordinatorId: 'COORD-001' },
    ],
  },
];

const mockPlacements: Placement[] = [
  { id: 'PLC-001', studentId: 'STU-10001', studentName: 'Alice Johnson', employerName: 'TechCorp Inc.', position: 'Software Developer Intern', startDate: '2026-01-15', endDate: '2026-04-30', status: 'Active' },
  { id: 'PLC-002', studentId: 'STU-10003', studentName: 'Carol Davis', employerName: 'DataFlow Ltd.', position: 'Data Analyst Intern', startDate: '2025-09-01', endDate: '2025-12-15', status: 'Dismissed', rejectionReason: 'Performance issues', rejectionDate: '2025-11-01' },
];

const mockEvaluations: EvaluationForm[] = [
  { id: 'EVAL-001', employerId: 'EMP-001', studentName: 'Alice Johnson', workTerm: 'Winter 2026', behaviour: 4, skills: 5, knowledge: 4, attitude: 5, comments: 'Excellent performer', submittedAt: '2026-02-15T10:00:00Z' },
];

const mockReports: WorkTermReport[] = [];

interface AppState {
  currentUser: User | null;
  applications: Application[];
  placements: Placement[];
  evaluations: EvaluationForm[];
  reports: WorkTermReport[];
  notifications: Notification[];
  login: (user: User) => void;
  logout: () => void;
  addApplication: (app: Omit<Application, 'id' | 'history'>) => boolean;
  updateApplicationStatus: (appId: string, status: ApplicationStatus, coordinatorId: string, reason?: string) => void;
  addPlacement: (placement: Omit<Placement, 'id'>) => void;
  addEvaluation: (eval_: Omit<EvaluationForm, 'id'>) => void;
  addReport: (report: Omit<WorkTermReport, 'id'>) => void;
  addNotification: (notif: Omit<Notification, 'id'>) => void;
}

let appIdCounter = 5;
let evalIdCounter = 2;
let reportIdCounter = 1;

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  applications: mockApplications,
  placements: mockPlacements,
  evaluations: mockEvaluations,
  reports: mockReports,
  notifications: [],
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
  addApplication: (app) => {
    const existing = get().applications;
    const isDuplicate = existing.some(a => a.studentId === app.studentId || a.studentEmail === app.studentEmail);
    if (isDuplicate) return false;
    const id = `APP-${String(appIdCounter++).padStart(3, '0')}`;
    const historyEntry: StatusHistoryEntry = {
      id: `H-${Date.now()}`, applicationId: id, studentId: app.studentId,
      status: 'Applied', timestamp: new Date().toISOString(), coordinatorId: 'system',
    };
    set({ applications: [...existing, { ...app, id, history: [historyEntry] }] });
    return true;
  },
  updateApplicationStatus: (appId, status, coordinatorId, reason) => {
    set({
      applications: get().applications.map(app => {
        if (app.id !== appId) return app;
        const entry: StatusHistoryEntry = {
          id: `H-${Date.now()}`, applicationId: appId, studentId: app.studentId,
          status, timestamp: new Date().toISOString(), coordinatorId, reason,
        };
        const updated = { ...app, status, history: [...app.history, entry] };
        // Auto-flag on dismissal/rejection
        if (status === 'Dismissed' || status === 'Placement Rejected') {
          const flagEntry: StatusHistoryEntry = {
            id: `H-${Date.now() + 1}`, applicationId: appId, studentId: app.studentId,
            status: 'Flagged for Review', timestamp: new Date().toISOString(), coordinatorId: 'system',
          };
          updated.status = 'Flagged for Review';
          updated.history = [...updated.history, flagEntry];
        }
        return updated;
      }),
    });
  },
  addPlacement: (placement) => {
    const id = `PLC-${String(get().placements.length + 1).padStart(3, '0')}`;
    set({ placements: [...get().placements, { ...placement, id }] });
  },
  addEvaluation: (eval_) => {
    const id = `EVAL-${String(evalIdCounter++).padStart(3, '0')}`;
    set({ evaluations: [...get().evaluations, { ...eval_, id }] });
  },
  addReport: (report) => {
    const id = `RPT-${String(reportIdCounter++).padStart(3, '0')}`;
    set({ reports: [...get().reports, { ...report, id }] });
  },
  addNotification: (notif) => {
    const id = `NOTIF-${Date.now()}`;
    set({ notifications: [...get().notifications, { ...notif, id }] });
  },
}));
