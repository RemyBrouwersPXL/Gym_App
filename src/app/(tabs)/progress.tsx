import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Session, WorkoutDay } from '@/data/plan';
import { exerciseHistory, sessionVolume } from '@/lib/stats';
import { getPlan, getSessions } from '@/lib/storage';
import { colors } from '@/lib/theme';

type Bar = { label: string; value: number };

function BarChart({ bars, unit }: { bars: Bar[]; unit: string }) {
  if (!bars.length) return <Text style={styles.empty}>No data yet — log a workout.</Text>;
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <View style={styles.chart}>
      {bars.map((b, i) => (
        <View key={i} style={styles.barCol}>
          <View style={styles.track}>
            <Text style={styles.barValue}>{Math.round(b.value)}</Text>
            {/* 80% cap leaves room for the value label above the tallest bar */}
            <View style={[styles.bar, { height: `${(b.value / max) * 80}%` }]} />
          </View>
          <Text style={styles.barLabel}>{b.label.slice(5)}</Text>
        </View>
      ))}
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const [plan, setPlan] = useState<WorkoutDay[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<string>();

  useFocusEffect(
    useCallback(() => {
      getPlan().then(setPlan);
      getSessions().then(setSessions);
    }, []),
  );

  const names = [...new Set(plan.flatMap((d) => d.exercises.map((e) => e.name)))];
  const name = selected ?? names[0];
  const history = name ? exerciseHistory(name, plan, sessions).slice(-8) : [];
  const recent = sessions.filter((s) => sessionVolume(s) > 0).slice(-8);
  const first = history[0];
  const last = history.at(-1);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.h}>Session volume</Text>
      <View style={styles.card}>
        <BarChart unit="kg × reps" bars={recent.map((s) => ({ label: s.date, value: sessionVolume(s) }))} />
      </View>

      <Text style={styles.h}>Exercise</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {names.map((n) => (
          <Pressable key={n} onPress={() => setSelected(n)} style={[styles.chip, n === name && styles.chipOn]}>
            <Text style={[styles.chipText, n === name && { color: colors.text }]}>{n}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.card}>
        <Text style={styles.sub}>Top set weight</Text>
        <BarChart unit="kg" bars={history.map((p) => ({ label: p.date, value: p.topWeight }))} />
        {first && last && history.length > 1 && (
          <Text style={styles.delta}>
            {last.topWeight - first.topWeight >= 0 ? '+' : ''}
            {last.topWeight - first.topWeight} kg since {first.date}
          </Text>
        )}
      </View>
      <View style={styles.card}>
        <Text style={styles.sub}>Exercise volume</Text>
        <BarChart unit="kg × reps" bars={history.map((p) => ({ label: p.date, value: p.volume }))} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 10, paddingBottom: 48 },
  h: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 8 },
  sub: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, gap: 8 },
  empty: { color: colors.muted, fontSize: 14, paddingVertical: 24, textAlign: 'center' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 6, paddingTop: 16 },
  barCol: { flex: 1, height: '100%', alignItems: 'center' },
  track: { flex: 1, width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '70%', backgroundColor: colors.accent, borderRadius: 4, minHeight: 2 },
  barValue: { color: colors.text, fontSize: 10, marginBottom: 2 },
  barLabel: { color: colors.muted, fontSize: 10, marginTop: 4 },
  unit: { position: 'absolute', top: 0, right: 0, color: colors.muted, fontSize: 10 },
  chips: { gap: 8 },
  chip: { borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.muted, fontSize: 13 },
  delta: { color: colors.accent, fontSize: 13, fontWeight: '600' },
});
