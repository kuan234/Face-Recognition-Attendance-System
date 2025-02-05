import { Stack } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
      setTimeout(() => {
      setStatusBarStyle("light");
    }, 0);
  }, []);
  return (
    <Stack>
      <Stack.Screen name="index" options={{     headerStyle: {
      backgroundColor: '#25292e',
    },headerTintColor: '#fff',title:'index', headerShown: false }} />
      <Stack.Screen name="(screens)" options={{ headerShown: false, title: 'Home' }} />

    </Stack>
  );
}
