// lib/store.ts
// All app state is stored in localStorage — no backend required

export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface Job {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  location: string;
  salary: string;
  notes: string;
  date: string;
  logo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  skills: string[];
  bio: string;
  experience: string;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  date: string;
  messages: { role: 'user' | 'ai'; content: string }[];
  score?: number;
}

export interface MockRequest {
  id: string;
  name: string;
  role: string;
  level: string;
  topic: string;
  status: 'open' | 'accepted' | 'completed';
  createdAt: string;
}

// ─── AUTH ───────────────────────────────────────────────────────────────────

const USERS_KEY = 'aicph_users';
const SESSION_KEY = 'aicph_session';

export function getAllUsers(): Record<string, User & { password: string }> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function saveUsers(users: Record<string, User & { password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register(name: string, email: string, password: string): User {
  const users = getAllUsers();
  if (users[email]) throw new Error('Account already exists with this email.');
  const user: User = {
    id: crypto.randomUUID(),
    name, email,
    skills: [],
    bio: '',
    experience: 'Entry Level',
    createdAt: new Date().toISOString(),
  };
  users[email] = { ...user, password };
  saveUsers(users);
  return user;
}

export function login(email: string, password: string): User {
  const users = getAllUsers();
  const u = users[email];
  if (!u) throw new Error('No account found with this email.');
  if (u.password !== password) throw new Error('Incorrect password.');
  const { password: _, ...user } = u;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function updateProfile(updates: Partial<User>) {
  const session = getSession();
  if (!session) return;
  const users = getAllUsers();
  const u = users[session.email];
  if (!u) return;
  const updated = { ...u, ...updates };
  users[session.email] = updated;
  saveUsers(users);
  const { password: _, ...user } = updated;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// ─── JOBS ───────────────────────────────────────────────────────────────────

export function getJobs(): Job[] {
  const session = getSession();
  if (!session) return [];
  const raw = localStorage.getItem(`aicph_jobs_${session.id}`);
  return raw ? JSON.parse(raw) : [];
}

export function saveJobs(jobs: Job[]) {
  const session = getSession();
  if (!session) return;
  localStorage.setItem(`aicph_jobs_${session.id}`, JSON.stringify(jobs));
}

export function addJob(job: Omit<Job, 'id' | 'date'>): Job {
  const jobs = getJobs();
  const newJob: Job = { ...job, id: crypto.randomUUID(), date: new Date().toISOString() };
  saveJobs([...jobs, newJob]);
  return newJob;
}

export function updateJob(id: string, updates: Partial<Job>) {
  const jobs = getJobs();
  saveJobs(jobs.map(j => j.id === id ? { ...j, ...updates } : j));
}

export function deleteJob(id: string) {
  saveJobs(getJobs().filter(j => j.id !== id));
}

// ─── INTERVIEW SESSIONS ──────────────────────────────────────────────────────

export function getInterviewSessions(): InterviewSession[] {
  const session = getSession();
  if (!session) return [];
  const raw = localStorage.getItem(`aicph_interviews_${session.id}`);
  return raw ? JSON.parse(raw) : [];
}

export function saveInterviewSession(sess: InterviewSession) {
  const sessions = getInterviewSessions();
  const idx = sessions.findIndex(s => s.id === sess.id);
  if (idx >= 0) sessions[idx] = sess;
  else sessions.unshift(sess);
  const user = getSession();
  if (user) localStorage.setItem(`aicph_interviews_${user.id}`, JSON.stringify(sessions));
}

// ─── MOCK REQUESTS ───────────────────────────────────────────────────────────

const MOCK_KEY = 'aicph_mock_requests';

export function getMockRequests(): MockRequest[] {
  const raw = localStorage.getItem(MOCK_KEY);
  return raw ? JSON.parse(raw) : generateDefaultMockRequests();
}

export function saveMockRequests(requests: MockRequest[]) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(requests));
}

export function addMockRequest(req: Omit<MockRequest, 'id' | 'createdAt' | 'status'>): MockRequest {
  const requests = getMockRequests();
  const newReq: MockRequest = { ...req, id: crypto.randomUUID(), status: 'open', createdAt: new Date().toISOString() };
  saveMockRequests([newReq, ...requests]);
  return newReq;
}

function generateDefaultMockRequests(): MockRequest[] {
  const requests: MockRequest[] = [
    { id: '1', name: 'Priya Sharma', role: 'SDE', level: 'Mid', topic: 'System Design', status: 'open', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', name: 'Arjun Mehta', role: 'Data Science', level: 'Entry', topic: 'ML Fundamentals', status: 'open', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: '3', name: 'Sneha Patel', role: 'PM', level: 'Senior', topic: 'Behavioral', status: 'open', createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: '4', name: 'Rahul Verma', role: 'SDE', level: 'Entry', topic: 'DSA', status: 'accepted', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '5', name: 'Ananya Nair', role: 'HR', level: 'Mid', topic: 'Communication', status: 'open', createdAt: new Date(Date.now() - 14400000).toISOString() },
  ];
  localStorage.setItem(MOCK_KEY, JSON.stringify(requests));
  return requests;
}
