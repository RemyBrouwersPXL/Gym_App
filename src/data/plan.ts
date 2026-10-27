// Data models + the seed 5-day split. Copied into AsyncStorage on first launch.

export type Exercise = {
  id: string;
  name: string;
  sets: string; // as written in the plan, e.g. "3-4"
  maxSets: number; // number of set rows shown in the logger
  reps: string; // target range, e.g. "8-10"
  tempo: string;
  notes: string;
};

export type WorkoutDay = {
  id: string;
  title: string;
  focus: string;
  exercises: Exercise[];
};

export type SetLog = { weight: string; reps: string; done?: boolean }; // kept as typed text; parsed when computing stats

export type Session = {
  id: string; // `${date}_${dayId}` -> one session per day per workout
  dayId: string;
  date: string; // YYYY-MM-DD
  logs: Record<string, SetLog[]>; // exerciseId -> sets
};

const T = '3:1:2:1';

// [name, sets, reps, notes]
type Row = [string, string, string, string];

function day(id: string, title: string, focus: string, rows: Row[]): WorkoutDay {
  return {
    id,
    title,
    focus,
    exercises: rows.map(([name, sets, reps, notes], i) => ({
      id: `${id}-${i}`,
      name,
      sets,
      maxSets: Number(sets.split('-').pop()),
      reps,
      tempo: T,
      notes,
    })),
  };
}

export const SEED_PLAN: WorkoutDay[] = [
  day('day1', 'Day 1 — Push', 'Chest / Shoulders / Triceps', [
    ['Incline DB Press', '3-4', '8-10', 'Lower slowly to upper chest, elbows slightly tucked, smooth press.'],
    ['Chest Press Machine', '3', '10-12', 'Shoulders back, grip slightly wide, squeeze chest at the top.'],
    ['Machine Shoulder Press', '3', '8-10', 'Lower to chin height, keep core braced, press with control.'],
    ['DB Lateral Raises', '3', '12-15', "Lead with elbows, lift to shoulder height, don't swing."],
    ['Cable Triceps Pushdown', '3', '12-15', 'Keep elbows locked in, extend fully, pause at bottom.'],
    ['Overhead Rope Extension', '3', '12-15', 'Stretch behind head, extend straight up, keep back still.'],
  ]),
  day('day2', 'Day 2 — Pull', 'Back / Rear Delts / Biceps', [
    ['Lat Pulldown', '3-4', '8-10', 'Pull elbows down to ribs, chest tall, avoid using momentum.'],
    ['Chest-Supported Row', '3', '8-10', 'Pull to lower chest, squeeze shoulder blades, stay supported.'],
    ['Seated Row', '3', '10-12', 'Sit tall, pull the handle to belly button, control the return.'],
    ['Rear Delt Fly', '3', '12-15', 'Move arms wide, feel rear delts, avoid shrugging shoulders.'],
    ['Dumbbell Curls', '3', '10-12', 'Keep elbows by your sides, curl slowly, palms up, full squeeze.'],
    ['Incline DB Curls', '2-3', '10-12', 'Let arms stretch fully at bottom, curl slowly, no swinging.'],
  ]),
  day('day3', 'Day 3 — Legs', 'Quads / Hamstrings / Calves', [
    ['Back Squat or Hack Squat', '3-4', '6-8', 'Brace core, squat under control, push through the whole foot.'],
    ['Leg Press', '3', '10-12', 'Feet mid-platform, knees to 90°, no locking out.'],
    ['Leg Extension', '3', '12-15', 'Lift with quads, pause at top, lower slowly.'],
    ['Hamstring Curl', '3', '10-12', 'Keep hips down, curl smoothly, squeeze at bottom.'],
    ['Calf Raise', '3-4', '12-15', 'Full stretch, push through big toe, slow descent.'],
  ]),
  day('day5', 'Day 5 — Chest / Back / Arms', 'Upper body', [
    ['Flat DB Press', '3-4', '6-8', 'Lower smoothly; elbows tucked; press evenly.'],
    ['Cable Chest Fly', '3', '12-15', 'Slight elbow bend, hands meet at chest height.'],
    ['Lat Pulldown (Neutral Grip)', '3', '10-12', 'Pull elbows down and forward; chest stays up.'],
    ['Seated Row', '3', '10-12', 'Pull to stomach, squeeze mid-back, slow return.'],
    ['Cable Bicep Curls', '3', '12-15', 'Keep elbows still, curl smoothly, full squeeze.'],
    ['Tricep Dips / Dip Machine', '3', '8-10', 'Lower to 90°, push up under control.'],
  ]),
  day('day6', 'Day 6 — Shoulders + Legs', 'Shoulders / Quads / Hamstrings', [
    ['DB Shoulder Press', '3-4', '6-8', "Lower to chin height, don't lock elbows, stay braced."],
    ['Lateral Raises', '3', '12-15', 'Lift to shoulder height, soft elbows, slow lower.'],
    ['Front Squat / Hack Squat', '3', '6-8', 'Keep torso upright, and drive knees forward comfortably.'],
    ['Hamstring Curl', '3', '10-12', 'Curl smoothly, squeeze hard, control stretch.'],
    ['Leg Extension', '3', '12-15', 'Lock quads at top, pause, lower slowly.'],
  ]),
];
