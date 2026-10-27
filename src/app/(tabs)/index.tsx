import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dayImage } from '@/data/images';
import { Session, WorkoutDay } from '@/data/plan';
import { getPlan, getSessions, today } from '@/lib/storage';
import { cardShadow, colors, radius } from '@/lib/theme';

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

function lastDoneLabel(date?: string) {
  if (!date) return 'Not done yet';
  const n = daysBetween(date, today());
  if (n <= 0) return 'Done today';
  if (n === 1) return 'Yesterday';
  return `${n} days ago`;
}

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<WorkoutDay[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      getPlan().then(setPlan);
      getSessions().then(setSessions);
    }, []),
  );

  // The day after the most recently trained one, wrapping around the split.
  const lastIndex = plan.findIndex((d) => d.id === sessions.at(-1)?.dayId);
  const nextId = plan[(lastIndex + 1) % Math.max(plan.length, 1)]?.id;
  const thisWeek = sessions.filter((s) => daysBetween(s.date, today()) < 7).length;
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.list, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>{dateLabel.toUpperCase()}</Text>
          <Text style={styles.heading}>Workouts</Text>
        </View>
        <View style={styles.weekPill}>
          <Ionicons name="flame" size={16} color={colors.accent} />
          <Text style={styles.weekText}>{thisWeek} this week</Text>
        </View>
      </View>

      {plan.map((day) => {
        const last = sessions.filter((s) => s.dayId === day.id).at(-1);
        const [label, name] = day.title.includes(' — ') ? day.title.split(' — ') : ['', day.title];
        const totalSets = day.exercises.reduce((n, e) => n + e.maxSets, 0);
        const isNext = day.id === nextId;
        return (
          <Link key={day.id} href={{ pathname: '/workout/[dayId]', params: { dayId: day.id } }} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.card,
                isNext && styles.cardNext,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
              ]}
            >
              <View style={styles.imageWrap}>
                <Image source={dayImage(day.id)} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
                <View style={styles.imageShade} />
                <View style={styles.chipRow}>
                  {!!label && <Text style={styles.dayChip}>{label.toUpperCase()}</Text>}
                  {isNext && (
                    <View style={styles.nextChip}>
                      <Ionicons name="play" size={10} color={colors.onAccent} />
                      <Text style={styles.nextText}>UP NEXT</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.body}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.title}>{name}</Text>
                  <Text style={styles.sub}>{day.focus}</Text>
                </View>
                <View style={[styles.go, isNext && { backgroundColor: colors.accent }]}>
                  <Ionicons name="chevron-forward" size={20} color={isNext ? colors.onAccent : colors.text} />
                </View>
              </View>

              <View style={styles.stats}>
                <Stat icon="barbell-outline" text={`${day.exercises.length} exercises`} />
                <Stat icon="layers-outline" text={`${totalSets} sets`} />
                <Stat icon="time-outline" text={lastDoneLabel(last?.date)} />
              </View>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );
}

function Stat({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={14} color={colors.muted} />
      <Text style={styles.statText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.bg },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  eyebrow: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  heading: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  weekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 6,
  },
  weekText: { color: colors.accent, fontSize: 13, fontWeight: '700' },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...cardShadow,
  },
  cardNext: { borderColor: colors.accent },
  imageWrap: { height: 140, backgroundColor: colors.cardRaised },
  imageShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(13, 16, 23, 0.25)' },
  chipRow: { flexDirection: 'row', gap: 8, padding: 12 },
  dayChip: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    backgroundColor: colors.overlay,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  nextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  nextText: { color: colors.onAccent, fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  body: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12, gap: 12 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  sub: { color: colors.muted, fontSize: 14 },
  go: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardRaised,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
});
