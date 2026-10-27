import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { dayImage, exerciseImage } from '@/data/images';
import { Exercise, Session, SetLog, WorkoutDay } from '@/data/plan';
import { setVolume } from '@/lib/stats';
import { getPlan, getSessions, saveSession, today } from '@/lib/storage';
import { cardShadow, colors, radius } from '@/lib/theme';

export default function WorkoutScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const [day, setDay] = useState<WorkoutDay>();
  const [session, setSession] = useState<Session>();
  const [previous, setPrevious] = useState<Session>(); // last earlier session of this day, shown as placeholders

  useEffect(() => {
    (async () => {
      const d = (await getPlan()).find((x) => x.id === dayId);
      const id = `${today()}_${dayId}`;
      const all = (await getSessions()).filter((s) => s.dayId === dayId);
      setDay(d);
      setSession(all.find((s) => s.id === id) ?? { id, dayId, date: today(), logs: {} });
      setPrevious(all.filter((s) => s.id !== id).at(-1));
    })();
  }, [dayId]);

  if (!day || !session) return null;

  // Autosave on every edit so nothing is lost if the app is closed mid-workout.
  const patch = (ex: Exercise, i: number, change: Partial<SetLog>) => {
    const sets = [...(session.logs[ex.id] ?? [])];
    for (let k = sets.length; k <= i; k++) sets[k] = { weight: '', reps: '' };
    sets[i] = { ...sets[i], ...change };
    const next = { ...session, logs: { ...session.logs, [ex.id]: sets } };
    setSession(next);
    saveSession(next);
  };

  // Checking off an empty set fills it from last session (or the target reps), like Hevy/Strong.
  const toggleDone = (ex: Exercise, i: number) => {
    const set = session.logs[ex.id]?.[i];
    if (set?.done) return patch(ex, i, { done: false });
    const prev = previous?.logs[ex.id]?.[i];
    patch(ex, i, {
      done: true,
      weight: set?.weight || prev?.weight || '',
      reps: set?.reps || prev?.reps || ex.reps.split('-')[0],
    });
  };

  const totalSets = day.exercises.reduce((n, e) => n + e.maxSets, 0);
  const doneSets = Object.values(session.logs).flat().filter((s) => s?.done);
  const volume = doneSets.reduce((sum, s) => sum + setVolume(s), 0);
  const [label, name] = day.title.includes(' — ') ? day.title.split(' — ') : ['', day.title];

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.hero}>
          <Image source={dayImage(day.id)} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
          <View style={styles.heroShade} />
          <View style={styles.heroText}>
            {!!label && <Text style={styles.eyebrow}>{label.toUpperCase()}</Text>}
            <Text style={styles.heroTitle}>{name}</Text>
            <Text style={styles.heroSub}>{day.focus}</Text>
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <SummaryItem value={`${doneSets.length}/${totalSets}`} label="Sets done" />
            <View style={styles.divider} />
            <SummaryItem value={`${Math.round(volume).toLocaleString()} kg`} label="Volume" />
            <View style={styles.divider} />
            <SummaryItem value={session.date.slice(5).replace('-', '/')} label="Today" />
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(doneSets.length / Math.max(totalSets, 1)) * 100}%` }]} />
          </View>
          {previous && (
            <Text style={styles.prevNote}>
              <Ionicons name="time-outline" size={12} color={colors.faint} /> Grey values are from {previous.date}
            </Text>
          )}
        </View>

        {day.exercises.map((ex, exIndex) => {
          const logs = session.logs[ex.id] ?? [];
          const done = logs.filter((s) => s?.done).length;
          const complete = done >= ex.maxSets;
          return (
            <View key={ex.id} style={[styles.card, complete && styles.cardComplete]}>
              <View style={styles.exHeader}>
                <Image
                  source={exerciseImage(ex.name, exIndex)}
                  style={styles.thumb}
                  contentFit="cover"
                  transition={200}
                />
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={styles.name} numberOfLines={2}>{ex.name}</Text>
                  <View style={styles.chips}>
                    <Chip icon="repeat-outline" text={`${ex.sets} × ${ex.reps}`} accent />
                    <Chip icon="speedometer-outline" text={ex.tempo} />
                  </View>
                </View>
                <View style={[styles.badge, complete && styles.badgeComplete]}>
                  {complete ? (
                    <Ionicons name="checkmark" size={16} color={colors.onAccent} />
                  ) : (
                    <Text style={styles.badgeText}>{done}/{ex.maxSets}</Text>
                  )}
                </View>
              </View>

              {!!ex.notes && (
                <View style={styles.notes}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
                  <Text style={styles.notesText}>{ex.notes}</Text>
                </View>
              )}

              <View style={styles.row}>
                <Text style={[styles.head, styles.setCol]}>SET</Text>
                <Text style={[styles.head, styles.prevCol]}>PREVIOUS</Text>
                <Text style={[styles.head, styles.inputCol]}>KG</Text>
                <Text style={[styles.head, styles.inputCol]}>REPS</Text>
                <View style={styles.checkCol}>
                  <Ionicons name="checkmark" size={14} color={colors.faint} />
                </View>
              </View>

              {Array.from({ length: ex.maxSets }, (_, i) => {
                const set = logs[i];
                const prev = previous?.logs[ex.id]?.[i];
                const isDone = !!set?.done;
                return (
                  <View key={i} style={[styles.row, styles.setRow, isDone && styles.setRowDone]}>
                    <View style={styles.setCol}>
                      <View style={[styles.setNum, isDone && styles.setNumDone]}>
                        <Text style={[styles.setNumText, isDone && { color: colors.onAccent }]}>{i + 1}</Text>
                      </View>
                    </View>
                    <Text style={[styles.prevText, styles.prevCol]} numberOfLines={1}>
                      {prev?.weight || prev?.reps ? `${prev.weight || '–'} × ${prev.reps || '–'}` : '—'}
                    </Text>
                    <TextInput
                      style={[styles.input, styles.inputCol, isDone && styles.inputDone]}
                      keyboardType="decimal-pad"
                      placeholder={prev?.weight || '—'}
                      placeholderTextColor={colors.faint}
                      value={set?.weight ?? ''}
                      onChangeText={(v) => patch(ex, i, { weight: v })}
                      selectTextOnFocus
                    />
                    <TextInput
                      style={[styles.input, styles.inputCol, isDone && styles.inputDone]}
                      keyboardType="number-pad"
                      placeholder={prev?.reps || ex.reps}
                      placeholderTextColor={colors.faint}
                      value={set?.reps ?? ''}
                      onChangeText={(v) => patch(ex, i, { reps: v })}
                      selectTextOnFocus
                    />
                    <Pressable
                      onPress={() => toggleDone(ex, i)}
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.checkCol,
                        styles.check,
                        isDone && styles.checkDone,
                        pressed && { transform: [{ scale: 0.92 }] },
                      ]}
                    >
                      <Ionicons name="checkmark" size={22} color={isDone ? colors.onAccent : colors.muted} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SummaryItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function Chip({ icon, text, accent }: { icon: keyof typeof Ionicons.glyphMap; text: string; accent?: boolean }) {
  const color = accent ? colors.accent : colors.muted;
  return (
    <View style={[styles.chip, accent && { backgroundColor: colors.accentSoft }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.chipText, { color }]}>{text}</Text>
    </View>
  );
}

const PILL_HEIGHT = 44;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 48, gap: 16 },

  hero: { height: 280, justifyContent: 'flex-end', backgroundColor: colors.cardRaised },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(13, 16, 23, 0.5)' },
  heroText: { padding: 20, paddingBottom: 44, gap: 4 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  heroSub: { color: '#C9CFDB', fontSize: 15, fontWeight: '500' },

  summary: {
    marginHorizontal: 16,
    marginTop: -40,
    backgroundColor: colors.cardRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
    ...cardShadow,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 2 },
  summaryValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
  summaryLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  divider: { width: 1, height: 28, backgroundColor: colors.border },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.bg, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
  prevNote: { color: colors.faint, fontSize: 12, textAlign: 'center' },

  card: {
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
    ...cardShadow,
  },
  cardComplete: { borderColor: 'rgba(197, 248, 42, 0.45)' },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.cardRaised },
  name: { color: colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardRaised,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  badge: {
    minWidth: 40,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.cardRaised,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  badgeComplete: { backgroundColor: colors.accent },
  badgeText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  notes: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: 4,
  },
  notesText: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 18 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setRow: { paddingVertical: 4, paddingHorizontal: 4, marginHorizontal: -4, borderRadius: radius.sm },
  setRowDone: { backgroundColor: colors.accentSoft },
  head: { color: colors.faint, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textAlign: 'center' },
  setCol: { width: 30, alignItems: 'center' },
  prevCol: { width: 64, textAlign: 'center' },
  inputCol: { flex: 1, textAlign: 'center' },
  checkCol: { width: PILL_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  setNum: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.cardRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumDone: { backgroundColor: colors.accent },
  setNumText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  prevText: { color: colors.faint, fontSize: 13, fontWeight: '600' },
  input: {
    height: PILL_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: 12,
  },
  inputDone: { borderColor: 'transparent', backgroundColor: 'rgba(13, 16, 23, 0.6)' },
  check: { height: PILL_HEIGHT, borderRadius: radius.pill, backgroundColor: colors.cardRaised },
  checkDone: { backgroundColor: colors.accent },
});
