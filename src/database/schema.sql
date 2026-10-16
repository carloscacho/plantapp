-- ============================================================================
-- IFPlantas — Schema do Banco de Dados
-- Baseado na planilha "Classificação Botânica Preenchida"
-- Banco: SQLite (expo-sqlite)
-- ============================================================================

-- ============================================================================
-- TABELA PRINCIPAL: plants
-- Aba "Plantas" da planilha (20 colunas)
-- Identificação, taxonomia, localização e metadados administrativos
-- ============================================================================
CREATE TABLE IF NOT EXISTS plants (
    id                    TEXT PRIMARY KEY NOT NULL,  -- Ex: "P001"
    nome_cientifico       TEXT NOT NULL,
    autor_nome            TEXT,                       -- Autor da nomenclatura (ex: "L.", "(Mart.) Vogel")
    nomes_populares       TEXT,                       -- Pode conter múltiplos, separados por ";"
    familia               TEXT,
    genero                TEXT,
    grupo_taxonomico      TEXT,                       -- "Angiosperma – eudicotiledônea", "Gimnosperma", etc.
    habito                TEXT,                       -- Erva, Arbusto, Árvore, Palmeira, Liana, etc.
    porte_altura          TEXT,                       -- Texto livre com faixas (ex: "1.52–2.44 m")
    ciclo_vida            TEXT,                       -- Anual, Bienal, Perene
    origem_biogeografica  TEXT,                       -- País/região de origem
    status_ocorrencia     TEXT,                       -- Nativa, Exótica, Naturalizada, etc.
    localizacao           TEXT,                       -- Local no campus do IFMS
    coordenadas           TEXT,                       -- GPS (lat, lng)
    colecao_canteiro      TEXT,                       -- Coleção ou canteiro específico
    codigo_qr             TEXT,                       -- URL ou ID do QR Code vinculado
    foto_principal        TEXT,                       -- URL/caminho da foto principal
    data_registro         TEXT,                       -- Data ISO 8601
    responsavel           TEXT,                       -- Nome do responsável pelo registro
    observacoes           TEXT,

    -- Campos de controle do app (não vêm da planilha)
    created_at            TEXT DEFAULT (datetime('now')),
    updated_at            TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- TABELA SATÉLITE: plant_roots_stems
-- Aba "Raiz e caule" da planilha (18 colunas de dados + ID + observações)
-- Relação 1:1 com plants
-- ============================================================================
CREATE TABLE IF NOT EXISTS plant_roots_stems (
    plant_id              TEXT PRIMARY KEY NOT NULL,

    -- Raiz
    sistema_radicular     TEXT,    -- Axial/pivotante, Fasciculado, Adventício, Misto
    habitat_raiz          TEXT,    -- Terrestre, Aquática, Aérea, Subterrânea
    raiz_primaria         TEXT,    -- Descrição da raiz primária
    raizes_adventicias    TEXT,    -- Presença e localização
    modificacao_raiz      TEXT,    -- Tubérculo, Escora, Haustório, Velame, etc.
    gravitropismo_raiz    TEXT,    -- Positivo, negativo, etc.

    -- Caule
    posicao_caule         TEXT,    -- Aéreo, Subterrâneo, Aéreo e subterrâneo
    tipo_caule            TEXT,    -- Tronco, Haste, Estipe, Colmo, Volúvel, Rizoma, etc.
    consistencia_caule    TEXT,    -- Herbácea, Lenhosa, Sublenhosa
    ramificacao           TEXT,    -- Monopodial, Simpodial, Dicotômica, etc.

    -- Gemas
    gema_apical           TEXT,
    gemas_axilares        TEXT,
    gemas_reprodutivas    TEXT,

    -- Estruturas especiais
    estrutura_reserva     TEXT,    -- Tubérculo caulinar, Rizoma, Bulbo, Cormo, etc.
    estruturas_fixacao    TEXT,    -- Gavinhas, Raízes grampiformes, Caule volúvel
    espinhos_aculeos      TEXT,    -- Presença/descrição
    lenticelas            TEXT,    -- Presença/descrição

    observacoes           TEXT,

    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABELA SATÉLITE: plant_leaves
-- Aba "Folhas" da planilha (28 colunas de dados + ID + observações)
-- Relação 1:1 com plants
-- ============================================================================
CREATE TABLE IF NOT EXISTS plant_leaves (
    plant_id              TEXT PRIMARY KEY NOT NULL,

    -- Tipo e disposição
    persistencia          TEXT,    -- Caduca, Persistente, Semicaduca
    composicao            TEXT,    -- Simples, Composta
    filotaxia             TEXT,    -- Alterna, Oposta, Verticilada, Rosulada, Dística
    insercao              TEXT,    -- Peciolada, Séssil, Amplexicaule, Invaginante, Peltada
    peciolo               TEXT,    -- Descrição do pecíolo
    bainha                TEXT,    -- Aberta, Fechada, Ausente
    ligula                TEXT,    -- Presença/tipo
    estipula              TEXT,    -- Livre, Adnata, Interpeciolar, Intrapeciolar, Ausente, etc.

    -- Limbo (lâmina foliar)
    limbo_forma           TEXT,    -- Acicular, Linear, Lanceolada, Elíptica, Ovada, Orbicular, etc.
    limbo_apice           TEXT,    -- Agudo, Acuminado, Obtuso, Arredondado, Emarginado, Mucronado, etc.
    limbo_base            TEXT,    -- Aguda, Atenuada, Cuneada, Arredondada, Cordada, Sagitada, etc.
    limbo_margem          TEXT,    -- Inteira, Serrada, Serreada, Denteada, Crenada, Lobada, etc.
    nervacao              TEXT,    -- Uninérvea, Paralelinérvea, Peninérvea, Palminérvea, etc.

    -- Superfície e textura
    textura_superficial   TEXT,    -- Lisa, Rugosa, Bullada, etc.
    indumento             TEXT,    -- Glabra, Pilosa, Pubescente, Tomentosa, Velutina, etc.
    consistencia          TEXT,    -- Membranácea, Cartácea, Coriácea, Carnosa, Herbácea
    cor_variegacao        TEXT,    -- Cor ou padrão especial
    dimensoes             TEXT,    -- Comprimento × largura

    -- Folha composta (se composição = Composta)
    folha_composta_tipo   TEXT,    -- Unifoliolada, Trifoliolada, Pinada, Bipinada, Digitada, etc.
    num_foliolos          TEXT,    -- Número de folíolos
    forma_foliolos        TEXT,    -- Forma dos folíolos individuais
    raquis                TEXT,    -- Descrição da raquis
    pulvino               TEXT,    -- Presença/tipo

    -- Metamorfoses foliares
    metamorfose_foliar    TEXT,    -- Brácteas, Espata, Catáfilo, etc.
    gavinhas              TEXT,    -- Presença/tipo
    espinhos_foliares     TEXT,    -- Presença/tipo
    bracteas              TEXT,    -- Presença/tipo

    observacoes           TEXT,

    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABELA SATÉLITE: plant_flowers_fruits
-- Aba "Flor e fruto" da planilha (29 colunas de dados + ID + observações)
-- Relação 1:1 com plants
-- ============================================================================
CREATE TABLE IF NOT EXISTS plant_flowers_fruits (
    plant_id                TEXT PRIMARY KEY NOT NULL,

    -- Sexualidade e inflorescência
    sexualidade_planta      TEXT,    -- Monoica, Dioica, Hermafrodita, Polígama
    inflorescencia          TEXT,    -- Solitária, Racemo, Espiga, Espádice, Panícula, etc.
    posicao_inflorescencia  TEXT,    -- Terminal, Axilar, etc.

    -- Flor
    flor_sexo               TEXT,    -- Bissexuada, Masculina, Feminina, Unissexuada
    flor_simetria           TEXT,    -- Actinomorfa, Zigomorfa, Assimétrica
    perianto                TEXT,    -- Aclamídea, Monoclamídea, Diclamídea, Homoclamídea, etc.
    calice                  TEXT,    -- Descrição do cálice
    corola                  TEXT,    -- Descrição da corola
    num_sepalas             TEXT,    -- Número ou fórmula
    num_petalas             TEXT,    -- Número ou fórmula
    conacao_aderencia       TEXT,    -- Dialissépalo, Gamossépalo, Dialipétalo, Gamopétalo
    androceu_num_estames    TEXT,    -- Número de estames
    anteras                 TEXT,    -- Tipo de deiscência/descrição
    gineceu_num_carpelos    TEXT,    -- Número de carpelos
    ovario                  TEXT,    -- Súpero, Ínfero, Semi-ínfero
    num_loculos             TEXT,    -- Número de lóculos
    placentacao             TEXT,    -- Axilar, Parietal, Central livre, Basal, Apical, Marginal
    hipanto                 TEXT,    -- Presença/tipo

    -- Fenologia floral
    epoca_floracao          TEXT,    -- Meses ou estação
    polinizadores           TEXT,    -- Insetos, vento, aves, etc.

    -- Fruto
    fruto_categoria         TEXT,    -- Simples, Agregado, Múltiplo, Acessório
    fruto_consistencia      TEXT,    -- Carnoso, Seco
    fruto_deiscencia        TEXT,    -- Deiscente, Indeiscente
    fruto_tipo              TEXT,    -- Baga, Drupa, Cápsula, Legume, Sâmara, etc.
    num_sementes            TEXT,    -- Número ou faixa
    dispersao               TEXT,    -- Anemocoria, Zoocoria, Hidrocoria, Autocoria, etc.
    pseudofruto             TEXT,    -- Descrição se houver parte acessória

    -- Fenologia do fruto
    epoca_frutificacao      TEXT,    -- Meses ou estação

    observacoes             TEXT,

    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABELA SATÉLITE: plant_cultivation
-- Aba "Cultivo" da planilha (23 colunas de dados + ID + observações)
-- Relação 1:1 com plants
-- ============================================================================
CREATE TABLE IF NOT EXISTS plant_cultivation (
    plant_id                  TEXT PRIMARY KEY NOT NULL,

    -- Condições ambientais ideais
    clima                     TEXT,    -- Tropical, Subtropical, Temperado
    faixa_temperatura         TEXT,    -- Faixa em °C
    luminosidade              TEXT,    -- Sol pleno, Meia-sombra, Sombra, Luz filtrada
    necessidade_hidrica       TEXT,    -- Baixa, Moderada, Alta
    umidade_ar                TEXT,    -- Nível preferido
    tipo_solo_substrato       TEXT,    -- Arenoso, Argiloso, Franco, Rico em MO, etc.
    drenagem                  TEXT,    -- Boa, Moderada, etc.
    ph                        TEXT,    -- Ácido, Neutro, Alcalino com faixas
    fertilidade               TEXT,    -- Nível de fertilidade do solo

    -- Tolerâncias
    tolerancia_frio           TEXT,    -- Baixa, Moderada, Alta
    tolerancia_seca           TEXT,    -- Baixa, Moderada, Alta
    tolerancia_encharcamento  TEXT,    -- Baixa, Moderada, Alta

    -- Propagação
    propagacao_principal      TEXT,    -- Sementes, Estaquia, Rizoma, etc.
    outras_propagacoes        TEXT,    -- Métodos alternativos

    -- Manejo
    poda_manutencao           TEXT,    -- Recomendações de poda
    pragas_observadas         TEXT,    -- Lista de pragas conhecidas
    doencas_observadas        TEXT,    -- Lista de doenças conhecidas
    toxicidade                TEXT,    -- Informação sobre toxicidade

    -- Usos
    uso_principal             TEXT,    -- Alimentícia, Ornamental, Medicinal, Florestal, etc.
    outros_usos               TEXT,    -- Usos secundários
    exigencias_edafoclimaticas TEXT,   -- Resumo das exigências
    adaptacao_regional        TEXT,    -- Adaptação ao clima/solo da região

    observacoes               TEXT,

    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABELA DE ÁREAS: areas
-- Grandes áreas/zonas do campus (Pomar, Campo Externo, Viveiro, etc.)
-- Cada área tem um polígono GPS que delimita seus limites no mapa
-- ============================================================================
CREATE TABLE IF NOT EXISTS areas (
    id              TEXT PRIMARY KEY NOT NULL,  -- Ex: "A001"
    nome            TEXT NOT NULL,              -- "Campo Externo", "Pomar", "Viveiro de Ornamentais"
    descricao       TEXT,                       -- Descrição da área
    tipo            TEXT,                       -- "pomar", "viveiro", "campo", "patio", "horta", "laboratorio"

    -- Polígono de limites (lista de pontos GPS serializada como JSON)
    -- Ex: [{"lat":-22.123,"lng":-54.789},{"lat":-22.124,"lng":-54.790},...]
    poligono_coords TEXT,

    -- Centro da área (para posicionar o label no mapa)
    centro_latitude  REAL,
    centro_longitude REAL,

    -- Estilo visual no mapa
    cor             TEXT DEFAULT '#32A041',     -- Cor do polígono no mapa (hex)
    icone           TEXT,                       -- Nome do ícone (MaterialIcons)
    opacidade       REAL DEFAULT 0.3,          -- Opacidade do preenchimento do polígono

    observacoes     TEXT,

    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- TABELA DE LOCALIZAÇÃO: plant_locations
-- Posicionamento GPS individual de cada exemplar/espécime de planta
-- Relação N:1 com plants (uma espécie pode ter múltiplos exemplares)
-- Relação N:1 com areas (cada exemplar pertence a uma área)
-- ============================================================================
CREATE TABLE IF NOT EXISTS plant_locations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id        TEXT NOT NULL,              -- FK → plants.id
    area_id         TEXT,                       -- FK → areas.id (pode ser null se área não mapeada)

    -- Coordenadas GPS do exemplar
    latitude        REAL NOT NULL,
    longitude       REAL NOT NULL,
    altitude        REAL,                       -- Altitude em metros (opcional)
    precisao_gps    REAL,                       -- Precisão do GPS em metros no momento da coleta

    -- Identificação do exemplar
    codigo_exemplar TEXT,                       -- Código de campo / etiqueta
    descricao       TEXT,                       -- Notas sobre este exemplar específico
    status          TEXT DEFAULT 'ativo',       -- 'ativo', 'removido', 'morto', 'transplantado'

    data_registro   TEXT,                       -- Data ISO 8601 do registro de localização
    registrado_por  TEXT,                       -- Quem registrou este ponto

    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id)  REFERENCES areas(id)  ON DELETE SET NULL
);

-- ============================================================================
-- TABELA AUXILIAR: plant_images
-- Suporte a múltiplas imagens por planta (fotos de campo, herbário, etc.)
-- Relação 1:N com plants
-- ============================================================================
CREATE TABLE IF NOT EXISTS plant_images (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id    TEXT NOT NULL,
    url         TEXT NOT NULL,              -- URL ou caminho local da imagem
    descricao   TEXT,                       -- Legenda/descrição da foto
    tipo        TEXT DEFAULT 'geral',       -- 'principal', 'folha', 'flor', 'fruto', 'casca', 'raiz', 'geral'
    ordem       INTEGER DEFAULT 0,          -- Ordem de exibição no carrossel

    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

-- ============================================================================
-- ÍNDICES para performance de buscas e filtros
-- ============================================================================

-- Plants
CREATE INDEX IF NOT EXISTS idx_plants_familia           ON plants(familia);
CREATE INDEX IF NOT EXISTS idx_plants_grupo_taxonomico  ON plants(grupo_taxonomico);
CREATE INDEX IF NOT EXISTS idx_plants_habito            ON plants(habito);
CREATE INDEX IF NOT EXISTS idx_plants_localizacao       ON plants(localizacao);
CREATE INDEX IF NOT EXISTS idx_plants_nome_cientifico   ON plants(nome_cientifico);
CREATE INDEX IF NOT EXISTS idx_plants_nomes_populares   ON plants(nomes_populares);

-- Images
CREATE INDEX IF NOT EXISTS idx_plant_images_plant_id    ON plant_images(plant_id);

-- Cultivation
CREATE INDEX IF NOT EXISTS idx_cultivation_uso          ON plant_cultivation(uso_principal);
CREATE INDEX IF NOT EXISTS idx_cultivation_luminosidade ON plant_cultivation(luminosidade);
CREATE INDEX IF NOT EXISTS idx_cultivation_propagacao   ON plant_cultivation(propagacao_principal);

-- Areas
CREATE INDEX IF NOT EXISTS idx_areas_nome               ON areas(nome);
CREATE INDEX IF NOT EXISTS idx_areas_tipo               ON areas(tipo);

-- Plant Locations
CREATE INDEX IF NOT EXISTS idx_plant_locations_plant_id  ON plant_locations(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_locations_area_id   ON plant_locations(area_id);
CREATE INDEX IF NOT EXISTS idx_plant_locations_coords    ON plant_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_plant_locations_status    ON plant_locations(status);

