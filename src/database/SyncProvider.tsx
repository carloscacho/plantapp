import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { ActivityIndicator, Snackbar, Text } from 'react-native-paper';
import { getLastSyncAt, syncFromServer } from './sync';

type SyncContextValue = {
  syncing: boolean;
  lastSyncAt: string | null;
  error: string | null;
  // Incrementa a cada sincronização bem-sucedida; use como dependência para recarregar dados
  dataVersion: number;
  syncNow: () => Promise<void>;
};

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync deve ser usado dentro de <SyncProvider>');
  return ctx;
}

/**
 * Ao abrir o app: sincroniza com o banco online, grava no SQLite e só então
 * libera as telas, que leem exclusivamente do banco local.
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const syncingRef = useRef(false);

  const runSync = useCallback(async (): Promise<string | null> => {
    if (syncingRef.current) return null;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const result = await syncFromServer(db);
      if (result.ok) {
        setLastSyncAt(result.syncedAt);
        setError(null);
        setDataVersion((v) => v + 1);
        return null;
      }
      setError(result.error);
      return result.error;
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [db]);

  useEffect(() => {
    let isMounted = true;

    async function initialSync() {
      const previous = await getLastSyncAt(db).catch(() => null);
      if (isMounted) setLastSyncAt(previous);

      const failure = await runSync();
      if (!isMounted) return;
      if (failure) {
        setSnackbar(
          previous
            ? `Sem conexão com o servidor. Usando dados salvos em ${formatDate(previous)}.`
            : 'Sem conexão com o servidor. Usando os dados que vieram com o app.'
        );
      }
      setInitialSyncDone(true);
    }

    initialSync();

    return () => {
      isMounted = false;
    };
  }, [db, runSync]);

  const syncNow = useCallback(async () => {
    const failure = await runSync();
    setSnackbar(failure ? `Falha ao sincronizar: ${failure}` : 'Dados atualizados com sucesso.');
  }, [runSync]);

  if (!initialSyncDone) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#32A041" />
        <Text variant="titleMedium" style={styles.loadingTitle}>
          Sincronizando dados…
        </Text>
        <Text variant="bodySmall" style={styles.loadingSubtitle}>
          Buscando as informações mais recentes do catálogo
        </Text>
      </View>
    );
  }

  return (
    <SyncContext.Provider value={{ syncing, lastSyncAt, error, dataVersion, syncNow }}>
      {children}
      <Snackbar visible={snackbar !== null} onDismiss={() => setSnackbar(null)} duration={4000}>
        {snackbar ?? ''}
      </Snackbar>
    </SyncContext.Provider>
  );
}

export function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('pt-BR');
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24 },
  loadingTitle: { marginTop: 16, fontWeight: 'bold', color: '#32A041' },
  loadingSubtitle: { marginTop: 4, color: '#666', textAlign: 'center' },
});
