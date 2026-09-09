import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { initDb } from '../database/sqllite';
import { ToastHost } from '@/components/ui/Toast';
import { PlayerEngine } from '@/audio/PlayerEngine';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import '@/global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDb()
      .then(() => setDbReady(true))
      .finally(() => SplashScreen.hideAsync());
  }, []);

  if (!dbReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlayerEngine />
      <MiniPlayer />
      <ToastHost />
      <Slot />
    </GestureHandlerRootView>
  );
}