import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { initializeDatabase } from '../database/init';
import { SyncProvider } from '../database/SyncProvider';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#32A041',
    secondaryContainer: '#e8f5e9',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <SQLiteProvider databaseName="plantas_v3.db" onInit={initializeDatabase}>
        <SyncProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="plant/[id]" options={{headerShown: false, title: 'Ficha da Planta', headerStyle: { backgroundColor: '#32A041' }, headerTintColor: '#fff' }} />
          <Stack.Screen name="admin/index" options={{ title: 'Painel Administrativo', headerStyle: { backgroundColor: '#32A041' }, headerTintColor: '#fff' }} />
          <Stack.Screen name="+not-found" options={{ title: 'Não Encontrado' }} />
        </Stack>
        </SyncProvider>
      </SQLiteProvider>
    </PaperProvider>
  );
}
