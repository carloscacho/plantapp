import { type SQLiteDatabase } from 'expo-sqlite';
import seedData from './seedData.json';

export async function initializeDatabase(db: SQLiteDatabase) {
  // Configuração recomendada para performance e integridade referencial
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  // Criação de todas as tabelas do sistema
  await db.execAsync(`
    -- Tabela Principal de Plantas
    CREATE TABLE IF NOT EXISTS plants (
      id                    TEXT PRIMARY KEY NOT NULL,
      nome_cientifico       TEXT NOT NULL,
      autor_nome            TEXT,
      nomes_populares       TEXT,
      familia               TEXT,
      genero                TEXT,
      grupo_taxonomico      TEXT,
      habito                TEXT,
      porte_altura          TEXT,
      ciclo_vida            TEXT,
      origem_biogeografica  TEXT,
      status_ocorrencia     TEXT,
      localizacao           TEXT,
      coordenadas           TEXT,
      colecao_canteiro      TEXT,
      codigo_qr             TEXT,
      foto_principal        TEXT,
      data_registro         TEXT,
      responsavel           TEXT,
      observacoes           TEXT,
      created_at            TEXT DEFAULT (datetime('now')),
      updated_at            TEXT DEFAULT (datetime('now'))
    );

    -- Tabela Satélite: Raiz e Caule (1:1)
    CREATE TABLE IF NOT EXISTS plant_roots_stems (
      plant_id              TEXT PRIMARY KEY NOT NULL,
      sistema_radicular     TEXT,
      habitat_raiz          TEXT,
      raiz_primaria         TEXT,
      raizes_adventicias    TEXT,
      modificacao_raiz      TEXT,
      gravitropismo_raiz    TEXT,
      posicao_caule         TEXT,
      tipo_caule            TEXT,
      consistencia_caule    TEXT,
      ramificacao           TEXT,
      gema_apical           TEXT,
      gemas_axilares        TEXT,
      gemas_reprodutivas    TEXT,
      estrutura_reserva     TEXT,
      estruturas_fixacao    TEXT,
      espinhos_aculeos      TEXT,
      lenticelas            TEXT,
      observacoes           TEXT,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    -- Tabela Satélite: Folhas (1:1)
    CREATE TABLE IF NOT EXISTS plant_leaves (
      plant_id              TEXT PRIMARY KEY NOT NULL,
      persistencia          TEXT,
      composicao            TEXT,
      filotaxia             TEXT,
      insercao              TEXT,
      peciolo               TEXT,
      bainha                TEXT,
      ligula                TEXT,
      estipula              TEXT,
      limbo_forma           TEXT,
      limbo_apice           TEXT,
      limbo_base            TEXT,
      limbo_margem          TEXT,
      nervacao              TEXT,
      textura_superficial   TEXT,
      indumento             TEXT,
      consistencia          TEXT,
      cor_variegacao        TEXT,
      dimensoes             TEXT,
      folha_composta_tipo   TEXT,
      num_foliolos          TEXT,
      forma_foliolos        TEXT,
      raquis                TEXT,
      pulvino               TEXT,
      metamorfose_foliar    TEXT,
      gavinhas              TEXT,
      espinhos_foliares     TEXT,
      bracteas              TEXT,
      observacoes           TEXT,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    -- Tabela Satélite: Flor e Fruto (1:1)
    CREATE TABLE IF NOT EXISTS plant_flowers_fruits (
      plant_id                TEXT PRIMARY KEY NOT NULL,
      sexualidade_planta      TEXT,
      inflorescencia          TEXT,
      posicao_inflorescencia  TEXT,
      flor_sexo               TEXT,
      flor_simetria           TEXT,
      perianto                TEXT,
      calice                  TEXT,
      corola                  TEXT,
      num_sepalas             TEXT,
      num_petalas             TEXT,
      conacao_aderencia       TEXT,
      androceu_num_estames    TEXT,
      anteras                 TEXT,
      gineceu_num_carpelos    TEXT,
      ovario                  TEXT,
      num_loculos             TEXT,
      placentacao             TEXT,
      hipanto                 TEXT,
      epoca_floracao          TEXT,
      polinizadores           TEXT,
      fruto_categoria         TEXT,
      fruto_consistencia      TEXT,
      fruto_deiscencia        TEXT,
      fruto_tipo              TEXT,
      num_sementes            TEXT,
      dispersao               TEXT,
      pseudofruto             TEXT,
      epoca_frutificacao      TEXT,
      observacoes             TEXT,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    -- Tabela Satélite: Cultivo (1:1)
    CREATE TABLE IF NOT EXISTS plant_cultivation (
      plant_id                  TEXT PRIMARY KEY NOT NULL,
      clima                     TEXT,
      faixa_temperatura         TEXT,
      luminosidade              TEXT,
      necessidade_hidrica       TEXT,
      umidade_ar                TEXT,
      tipo_solo_substrato       TEXT,
      drenagem                  TEXT,
      ph                        TEXT,
      fertilidade               TEXT,
      tolerancia_frio           TEXT,
      tolerancia_seca           TEXT,
      tolerancia_encharcamento  TEXT,
      propagacao_principal      TEXT,
      outras_propagacoes        TEXT,
      poda_manutencao           TEXT,
      pragas_observadas         TEXT,
      doencas_observadas        TEXT,
      toxicidade                TEXT,
      uso_principal             TEXT,
      outros_usos               TEXT,
      exigencias_edafoclimaticas TEXT,
      adaptacao_regional        TEXT,
      observacoes               TEXT,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    -- Tabela de Grandes Áreas do Campus
    CREATE TABLE IF NOT EXISTS areas (
      id              TEXT PRIMARY KEY NOT NULL,
      nome            TEXT NOT NULL,
      descricao       TEXT,
      tipo            TEXT,
      poligono_coords TEXT,
      centro_latitude  REAL,
      centro_longitude REAL,
      cor             TEXT DEFAULT '#32A041',
      icone           TEXT,
      opacidade       REAL DEFAULT 0.35,
      observacoes     TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    -- Tabela de Localizações GPS dos Exemplares
    CREATE TABLE IF NOT EXISTS plant_locations (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id        TEXT NOT NULL,
      area_id         TEXT,
      latitude        REAL NOT NULL,
      longitude       REAL NOT NULL,
      altitude        REAL,
      precisao_gps    REAL,
      codigo_exemplar TEXT,
      descricao       TEXT,
      status          TEXT DEFAULT 'ativo',
      data_registro   TEXT,
      registrado_por  TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
      FOREIGN KEY (area_id)  REFERENCES areas(id)  ON DELETE SET NULL
    );

    -- Tabela Auxiliar de Imagens
    CREATE TABLE IF NOT EXISTS plant_images (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id    TEXT NOT NULL,
      url         TEXT NOT NULL,
      descricao   TEXT,
      tipo        TEXT DEFAULT 'geral',
      ordem       INTEGER DEFAULT 0,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_plants_familia           ON plants(familia);
    CREATE INDEX IF NOT EXISTS idx_plants_grupo_taxonomico  ON plants(grupo_taxonomico);
    CREATE INDEX IF NOT EXISTS idx_plants_habito            ON plants(habito);
    CREATE INDEX IF NOT EXISTS idx_plants_localizacao       ON plants(localizacao);
    CREATE INDEX IF NOT EXISTS idx_plants_nome_cientifico   ON plants(nome_cientifico);
    CREATE INDEX IF NOT EXISTS idx_plants_nomes_populares   ON plants(nomes_populares);
    CREATE INDEX IF NOT EXISTS idx_plant_images_plant_id    ON plant_images(plant_id);
    CREATE INDEX IF NOT EXISTS idx_cultivation_uso          ON plant_cultivation(uso_principal);
    CREATE INDEX IF NOT EXISTS idx_cultivation_luminosidade ON plant_cultivation(luminosidade);
    CREATE INDEX IF NOT EXISTS idx_cultivation_propagacao   ON plant_cultivation(propagacao_principal);
    CREATE INDEX IF NOT EXISTS idx_areas_nome               ON areas(nome);
    CREATE INDEX IF NOT EXISTS idx_plant_locations_plant_id  ON plant_locations(plant_id);
    CREATE INDEX IF NOT EXISTS idx_plant_locations_area_id   ON plant_locations(area_id);
    CREATE INDEX IF NOT EXISTS idx_plant_locations_coords    ON plant_locations(latitude, longitude);
  `);

  // Verificar se o banco já contém dados
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM plants');

  if (result && result.count === 0) {
    // Carga inicial transacional dos dados da planilha e áreas padrão
    await db.withTransactionAsync(async () => {
      // 1. Áreas
      for (const a of seedData.areas) {
        await db.runAsync(
          `INSERT OR IGNORE INTO areas (id, nome, descricao, tipo, cor, icone, opacidade, centro_latitude, centro_longitude)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          a.id, a.nome, a.descricao, a.tipo, a.cor, a.icone, a.opacidade, a.centro_latitude, a.centro_longitude
        );
      }

      // 2. Plantas
      for (const p of seedData.plants) {
        await db.runAsync(
          `INSERT OR IGNORE INTO plants (
            id, nome_cientifico, autor_nome, nomes_populares, familia, genero,
            grupo_taxonomico, habito, porte_altura, ciclo_vida, origem_biogeografica,
            status_ocorrencia, localizacao, coordenadas, colecao_canteiro, codigo_qr,
            foto_principal, data_registro, responsavel, observacoes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          p.id, p.nome_cientifico, p.autor_nome, p.nomes_populares, p.familia, p.genero,
          p.grupo_taxonomico, p.habito, p.porte_altura, p.ciclo_vida, p.origem_biogeografica,
          p.status_ocorrencia, p.localizacao, p.coordenadas, p.colecao_canteiro, p.codigo_qr,
          p.foto_principal, p.data_registro, p.responsavel, p.observacoes
        );
      }

      // 3. Raiz e Caule
      for (const r of seedData.roots_stems) {
        await db.runAsync(
          `INSERT OR IGNORE INTO plant_roots_stems (
            plant_id, sistema_radicular, habitat_raiz, raiz_primaria, raizes_adventicias,
            modificacao_raiz, gravitropismo_raiz, posicao_caule, tipo_caule, consistencia_caule,
            ramificacao, gema_apical, gemas_axilares, gemas_reprodutivas, estrutura_reserva,
            estruturas_fixacao, espinhos_aculeos, lenticelas, observacoes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          r.plant_id, r.sistema_radicular, r.habitat_raiz, r.raiz_primaria, r.raizes_adventicias,
          r.modificacao_raiz, r.gravitropismo_raiz, r.posicao_caule, r.tipo_caule, r.consistencia_caule,
          r.ramificacao, r.gema_apical, r.gemas_axilares, r.gemas_reprodutivas, r.estrutura_reserva,
          r.estruturas_fixacao, r.espinhos_aculeos, r.lenticelas, r.observacoes
        );
      }

      // 4. Folhas
      for (const l of seedData.leaves) {
        await db.runAsync(
          `INSERT OR IGNORE INTO plant_leaves (
            plant_id, persistencia, composicao, filotaxia, insercao, peciolo, bainha,
            ligula, estipula, limbo_forma, limbo_apice, limbo_base, limbo_margem, nervacao,
            textura_superficial, indumento, consistencia, cor_variegacao, dimensoes,
            folha_composta_tipo, num_foliolos, forma_foliolos, raquis, pulvino,
            metamorfose_foliar, gavinhas, espinhos_foliares, bracteas, observacoes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          l.plant_id, l.persistencia, l.composicao, l.filotaxia, l.insercao, l.peciolo, l.bainha,
          l.ligula, l.estipula, l.limbo_forma, l.limbo_apice, l.limbo_base, l.limbo_margem, l.nervacao,
          l.textura_superficial, l.indumento, l.consistencia, l.cor_variegacao, l.dimensoes,
          l.folha_composta_tipo, l.num_foliolos, l.forma_foliolos, l.raquis, l.pulvino,
          l.metamorfose_foliar, l.gavinhas, l.espinhos_foliares, l.bracteas, l.observacoes
        );
      }

      // 5. Flor e Fruto
      for (const f of seedData.flowers_fruits) {
        await db.runAsync(
          `INSERT OR IGNORE INTO plant_flowers_fruits (
            plant_id, sexualidade_planta, inflorescencia, posicao_inflorescencia, flor_sexo,
            flor_simetria, perianto, calice, corola, num_sepalas, num_petalas, conacao_aderencia,
            androceu_num_estames, anteras, gineceu_num_carpelos, ovario, num_loculos,
            placentacao, hipanto, epoca_floracao, polinizadores, fruto_categoria,
            fruto_consistencia, fruto_deiscencia, fruto_tipo, num_sementes, dispersao,
            pseudofruto, epoca_frutificacao, observacoes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          f.plant_id, f.sexualidade_planta, f.inflorescencia, f.posicao_inflorescencia, f.flor_sexo,
          f.flor_simetria, f.perianto, f.calice, f.corola, f.num_sepalas, f.num_petalas, f.conacao_aderencia,
          f.androceu_num_estames, f.anteras, f.gineceu_num_carpelos, f.ovario, f.num_loculos,
          f.placentacao, f.hipanto, f.epoca_floracao, f.polinizadores, f.fruto_categoria,
          f.fruto_consistencia, f.fruto_deiscencia, f.fruto_tipo, f.num_sementes, f.dispersao,
          f.pseudofruto, f.epoca_frutificacao, f.observacoes
        );
      }

      // 6. Cultivo
      for (const c of seedData.cultivation) {
        await db.runAsync(
          `INSERT OR IGNORE INTO plant_cultivation (
            plant_id, clima, faixa_temperatura, luminosidade, necessidade_hidrica, umidade_ar,
            tipo_solo_substrato, drenagem, ph, fertilidade, tolerancia_frio, tolerancia_seca,
            tolerancia_encharcamento, propagacao_principal, outras_propagacoes, poda_manutencao,
            pragas_observadas, doencas_observadas, toxicidade, uso_principal, outros_usos,
            exigencias_edafoclimaticas, adaptacao_regional, observacoes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          c.plant_id, c.clima, c.faixa_temperatura, c.luminosidade, c.necessidade_hidrica, c.umidade_ar,
          c.tipo_solo_substrato, c.drenagem, c.ph, c.fertilidade, c.tolerancia_frio, c.tolerancia_seca,
          c.tolerancia_encharcamento, c.propagacao_principal, c.outras_propagacoes, c.poda_manutencao,
          c.pragas_observadas, c.doencas_observadas, c.toxicidade, c.uso_principal, c.outros_usos,
          c.exigencias_edafoclimaticas, c.adaptacao_regional, c.observacoes
        );
      }
    });
  }

  // Sempre sincroniza as áreas com o seedData para garantir as 8 áreas com polígonos e cores atualizadas
  try {
    for (const a of seedData.areas) {
      await db.runAsync(
        `INSERT INTO areas (id, nome, descricao, tipo, cor, icone, opacidade, centro_latitude, centro_longitude, poligono_coords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           nome = excluded.nome,
           descricao = excluded.descricao,
           tipo = excluded.tipo,
           cor = excluded.cor,
           icone = excluded.icone,
           opacidade = excluded.opacidade,
           centro_latitude = excluded.centro_latitude,
           centro_longitude = excluded.centro_longitude,
           poligono_coords = excluded.poligono_coords`,
        a.id,
        a.nome,
        a.descricao,
        a.tipo,
        a.cor,
        a.icone,
        a.opacidade,
        a.centro_latitude,
        a.centro_longitude,
        JSON.stringify(a.poligono_coords)
      );
    }
  } catch (syncErr) {
    console.warn('Erro ao sincronizar áreas:', syncErr);
  }
}

