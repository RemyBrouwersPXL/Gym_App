import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '@/lib/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg, shadowOpacity: 0, elevation: 0 },
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Workouts',
          headerShown: false, // the screen draws its own large header
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'barbell' : 'barbell-outline'} color={color as string} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color as string} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
