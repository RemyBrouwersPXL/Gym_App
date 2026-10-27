import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED_PLAN, Session, WorkoutDay } from '@/data/plan';

const PLAN_KEY = 'plan_v1';
const SESSIONS_KEY = 'sessions_v1';

export const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

export async function getPlan(): Promise<WorkoutDay[]> {
  const raw = await AsyncStorage.getItem(PLAN_KEY);
  if (raw) return JSON.parse(raw);
  await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(SEED_PLAN));
  return SEED_PLAN;
}

export async function getSessions(): Promise<Session[]> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  const sessions: Session[] = raw ? JSON.parse(raw) : [];
  return sessions.sort((a, b) => a.date.localeCompare(b.date));
}

export async function saveSession(session: Session) {
  const sessions = (await getSessions()).filter((s) => s.id !== session.id);
  sessions.push(session);
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
