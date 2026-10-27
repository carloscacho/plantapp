import { Platform } from 'react-native';
import { type SQLiteDatabase } from 'expo-sqlite';

// URL do painel administrativo (ex: https://buscakaavo.vercel.app). Definida em platapp/.env
const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ?? '';
const SYNC_TIMEOUT_MS = 15000;

type Row = Record<string, unknown>;

type SyncSnapshot = {
  generatedAt: string;
  plants: Row[];
  roots_stems: Row[];
  leaves: Row[];
  flowers_fruits: Row[];
  cultivation: Row[];
  areas: Row[];
  locations: Row[];
  images: Row[];
};

// Ordem de inserção respeitando as chaves estrangeiras (a exclusão usa a ordem inversa)
const TABLES: { key: Exclude<keyof SyncSnapshot, 'generatedAt'>; table: string }[] = [
  { key: 'areas', table: 'areas' },
  { key: 'plants', table: 'plants' },
  { key: 'roots_stems', table: 'plant_roots_stems' },
  { key: 'leaves', table: 'plant_leaves' },
  { key: 'flowers_fruits', table: 'plant_flowers_fruits' },
  { key: 'cultivation', table: 'plant_cultivation' },
  { key: 'locations', table: 'plant_locations' },
  { key: 'images', table: 'plant_images' },
];

export type SyncResult =
  | { ok: true; syncedAt: string; plants: number }
  | { ok: false; error: string };

export function isSyncConfigured() {
  return API_URL !== '';
}

export async function getLastSyncAt(db: SQLiteDatabase): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM sync_meta WHERE key = 'last_sync_at'"
  );
  return row?.value ?? null;
}

function isSnapshot(data: unknown): data is SyncSnapshot {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.generatedAt === 'string' && TABLES.every(({ key }) => Array.isArray(obj[key]));
}

async function fetchSnapshot(): Promise<SyncSnapshot> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);
  try {
    const url = `${API_URL}/api/public/sync`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Servidor respondeu com erro ${response.status} (${url}).`);
    }
    const data: unknown = await response.json();
    if (!isSnapshot(data)) {
      throw new Error('Resposta do servidor em formato inesperado.');
    }
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao contactar o servidor.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function toSqliteValue(value: unknown): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return JSON.stringify(value);
}

async function replaceTable(tx: SQLiteDatabase, table: string, rows: Row[]) {
  // Só grava colunas que existem no schema local, ignorando campos novos do servidor
  const localColumns = await tx.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  const known = new Set(localColumns.map((c) => c.name));
  const columns = rows.length > 0 ? Object.keys(rows[0]).filter((c) => known.has(c)) : [];

  if (columns.length === 0) return;

  const statement = await tx.prepareAsync(
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`
  );
  try {
    for (const row of rows) {
      await statement.executeAsync(columns.map((c) => toSqliteValue(row[c])));
    }
  } finally {
    await statement.finalizeAsync();
  }
}

// Exclusive transaction impede que leituras das telas vejam o banco pela metade
function runInTransaction(db: SQLiteDatabase, task: (tx: SQLiteDatabase) => Promise<void>) {
  if (Platform.OS === 'web') {
    return db.withTransactionAsync(() => task(db));
  }
  return db.withExclusiveTransactionAsync((txn) => task(txn));
}

/**
 * Baixa o snapshot do banco online e substitui o conteúdo do SQLite local.
 * Em caso de falha (offline, timeout, erro do servidor) os dados locais ficam intactos.
 */
export async function syncFromServer(db: SQLiteDatabase): Promise<SyncResult> {
  if (!isSyncConfigured()) {
    return { ok: false, error: 'Servidor de sincronização não configurado (EXPO_PUBLIC_API_URL).' };
  }

  try {
    const snapshot = await fetchSnapshot();
    const syncedAt = new Date().toISOString();

    await runInTransaction(db, async (tx) => {
      for (const { table } of [...TABLES].reverse()) {
        await tx.runAsync(`DELETE FROM ${table}`);
      }
      for (const { key, table } of TABLES) {
        await replaceTable(tx, table, snapshot[key]);
      }
      await tx.runAsync(
        "INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_sync_at', ?)",
        syncedAt
      );
    });

    return { ok: true, syncedAt, plants: snapshot.plants.length };
  } catch (error) {
    console.warn('Falha na sincronização:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Não foi possível sincronizar.',
    };
  }
}
