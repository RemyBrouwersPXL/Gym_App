import { Session, SetLog, WorkoutDay } from '@/data/plan';

const num = (s: string) => parseFloat(s.replace(',', '.')) || 0;

export const setVolume = (s: SetLog) => num(s.weight) * num(s.reps);

export const sessionVolume = (s: Session) =>
  Object.values(s.logs).flat().reduce((sum, set) => sum + setVolume(set), 0);

export type ExercisePoint = { date: string; topWeight: number; volume: number };

// Exercises are grouped by name, so e.g. "Seated Row" on Day 2 and Day 5 share one history.
export function exerciseHistory(name: string, plan: WorkoutDay[], sessions: Session[]): ExercisePoint[] {
  const ids = new Set(plan.flatMap((d) => d.exercises.filter((e) => e.name === name).map((e) => e.id)));
  const points: ExercisePoint[] = [];
  for (const s of sessions) {
    const sets = Object.entries(s.logs)
      .filter(([id]) => ids.has(id))
      .flatMap(([, v]) => v)
      .filter((x) => num(x.reps) > 0);
    if (!sets.length) continue;
    points.push({
      date: s.date,
      topWeight: Math.max(...sets.map((x) => num(x.weight))),
      volume: sets.reduce((sum, x) => sum + setVolume(x), 0),
    });
  }
  return points;
}
