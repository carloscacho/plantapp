import { type SQLiteDatabase } from 'expo-sqlite';
import { mockPlants } from './mockData';

export async function initializeDatabase(db: SQLiteDatabase) {
  // Configuração recomendada para performance
  await db.execAsync(`PRAGMA journal_mode = WAL;`);

  // Criação da tabela principal de Plantas
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY NOT NULL,
      nomePopular TEXT NOT NULL,
      nomeCientifico TEXT NOT NULL,
      familia TEXT,
      area TEXT,
      tipoReproducao TEXT,
      porte TEXT,
      clima TEXT,
      descricao TEXT,
      qrCodeUrl TEXT,
      imageUrl TEXT
    );
  `);

  // Checar se a tabela está vazia
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM plants');
  
  if (result && result.count === 0) {
    // Inserir os dados iniciais do mockData para que o aplicativo não inicie vazio
    for (const p of mockPlants) {
      await db.runAsync(
        'INSERT INTO plants (id, nomePopular, nomeCientifico, familia, area, tipoReproducao, porte, clima, descricao, qrCodeUrl, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        p.id, p.nomePopular, p.nomeCientifico, p.familia, p.area, p.tipoReproducao, p.porte, p.clima, p.descricao, p.qrCodeUrl, p.imageUrl
      );
    }
  }
}
