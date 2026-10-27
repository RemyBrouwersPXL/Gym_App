import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '@/lib/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="workout/[dayId]"
          options={{
            // Floats over the hero image at the top of the workout screen.
            headerTransparent: true,
            title: '',
            headerShadowVisible: false,
            headerBackVisible: false,
            headerLeft: () => (
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
            ),
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
