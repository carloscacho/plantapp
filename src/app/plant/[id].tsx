import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSync } from '../../database/SyncProvider';
import { useState, useEffect } from 'react';
import { Appbar, Text, Card, ActivityIndicator, Button, Chip, Badge } from 'react-native-paper';
import { Image } from 'expo-image';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type PlantData = {
  id: string;
  nome_cientifico: string;
  autor_nome: string | null;
  nomes_populares: string | null;
  familia: string | null;
  genero: string | null;
  grupo_taxonomico: string | null;
  habito: string | null;
  porte_altura: string | null;
  ciclo_vida: string | null;
  origem_biogeografica: string | null;
  status_ocorrencia: string | null;
  localizacao: string | null;
  coordenadas: string | null;
  colecao_canteiro: string | null;
  codigo_qr: string | null;
  foto_principal: string | null;
  data_registro: string | null;
  responsavel: string | null;
  observacoes: string | null;
};

type RootsStemsData = {
  sistema_radicular: string | null;
  habitat_raiz: string | null;
  raiz_primaria: string | null;
  raizes_adventicias: string | null;
  modificacao_raiz: string | null;
  gravitropismo_raiz: string | null;
  posicao_caule: string | null;
  tipo_caule: string | null;
  consistencia_caule: string | null;
  ramificacao: string | null;
  gema_apical: string | null;
  gemas_axilares: string | null;
  gemas_reprodutivas: string | null;
  estrutura_reserva: string | null;
  estruturas_fixacao: string | null;
  espinhos_aculeos: string | null;
  lenticelas: string | null;
  observacoes: string | null;
};

type LeavesData = {
  persistencia: string | null;
  composicao: string | null;
  filotaxia: string | null;
  insercao: string | null;
  peciolo: string | null;
  bainha: string | null;
  ligula: string | null;
  estipula: string | null;
  limbo_forma: string | null;
  limbo_apice: string | null;
  limbo_base: string | null;
  limbo_margem: string | null;
  nervacao: string | null;
  textura_superficial: string | null;
  indumento: string | null;
  consistencia: string | null;
  cor_variegacao: string | null;
  dimensoes: string | null;
  folha_composta_tipo: string | null;
  num_foliolos: string | null;
  forma_foliolos: string | null;
  raquis: string | null;
  pulvino: string | null;
  metamorfose_foliar: string | null;
  gavinhas: string | null;
  espinhos_foliares: string | null;
  bracteas: string | null;
  observacoes: string | null;
};

type FlowersFruitsData = {
  sexualidade_planta: string | null;
  inflorescencia: string | null;
  posicao_inflorescencia: string | null;
  flor_sexo: string | null;
  flor_simetria: string | null;
  perianto: string | null;
  calice: string | null;
  corola: string | null;
  num_sepalas: string | null;
  num_petalas: string | null;
  conacao_aderencia: string | null;
  androceu_num_estames: string | null;
  anteras: string | null;
  gineceu_num_carpelos: string | null;
  ovario: string | null;
  num_loculos: string | null;
  placentacao: string | null;
  hipanto: string | null;
  epoca_floracao: string | null;
  polinizadores: string | null;
  fruto_categoria: string | null;
  fruto_consistencia: string | null;
  fruto_deiscencia: string | null;
  fruto_tipo: string | null;
  num_sementes: string | null;
  dispersao: string | null;
  pseudofruto: string | null;
  epoca_frutificacao: string | null;
  observacoes: string | null;
};

type CultivationData = {
  clima: string | null;
  faixa_temperatura: string | null;
  luminosidade: string | null;
  necessidade_hidrica: string | null;
  umidade_ar: string | null;
  tipo_solo_substrato: string | null;
  drenagem: string | null;
  ph: string | null;
  fertilidade: string | null;
  tolerancia_frio: string | null;
  tolerancia_seca: string | null;
  tolerancia_encharcamento: string | null;
  propagacao_principal: string | null;
  outras_propagacoes: string | null;
  poda_manutencao: string | null;
  pragas_observadas: string | null;
  doencas_observadas: string | null;
  toxicidade: string | null;
  uso_principal: string | null;
  outros_usos: string | null;
  exigencias_edafoclimaticas: string | null;
  adaptacao_regional: string | null;
  observacoes: string | null;
};

type PlantTheme = {
  primary: string;
  titleColor: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  headerSub: string;
  placeholderBg: string;
};

function getThemeForHabit(habito: string | null | undefined): PlantTheme {
  const h = (habito || '').toLowerCase();
  if (h.includes('erva')) {
    return {
      primary: '#1565C0',        // Azul Safira
      titleColor: '#1565C0',
      accent: '#0D47A1',
      badgeBg: '#E3F2FD',
      badgeText: '#0D47A1',
      headerSub: '#E3F2FD',
      placeholderBg: '#E3F2FD',
    };
  }
  if (h.includes('arbusto') && !h.includes('subarbusto')) {
    return {
      primary: '#B45309',        // Âmbar / Amarelo Ocre de alto contraste
      titleColor: '#B45309',
      accent: '#78350F',
      badgeBg: '#FEF3C7',
      badgeText: '#78350F',
      headerSub: '#FEF3C7',
      placeholderBg: '#FEF3C7',
    };
  }
  if (h.includes('subarbusto')) {
    return {
      primary: '#6A1B9A',        // Roxo Profundo
      titleColor: '#6A1B9A',
      accent: '#4A148C',
      badgeBg: '#F3E5F5',
      badgeText: '#4A148C',
      headerSub: '#F3E5F5',
      placeholderBg: '#F3E5F5',
    };
  }
  if (h.includes('trepadeira')) {
    return {
      primary: '#00695C',        // Teal
      titleColor: '#00695C',
      accent: '#004D40',
      badgeBg: '#E0F2F1',
      badgeText: '#004D40',
      headerSub: '#E0F2F1',
      placeholderBg: '#E0F2F1',
    };
  }
  if (h.includes('árvore') || h.includes('arvore')) {
    return {
      primary: '#1B5E20',        // Verde Floresta Profundo
      titleColor: '#1B5E20',
      accent: '#0D3C12',
      badgeBg: '#E8F5E9',
      badgeText: '#1B5E20',
      headerSub: '#E8F5E9',
      placeholderBg: '#E8F5E9',
    };
  }
  return {
    primary: '#2E7D32',          // Verde Botânico Padrão
    titleColor: '#2E7D32',
    accent: '#1B5E20',
    badgeBg: '#E8F5E9',
    badgeText: '#1B5E20',
    headerSub: '#E8F5E9',
    placeholderBg: '#E8F5E9',
  };
}

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const db = useSQLiteContext();
  const { dataVersion } = useSync();

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('geral');

  const [plant, setPlant] = useState<PlantData | null>(null);
  const [rootsStems, setRootsStems] = useState<RootsStemsData | null>(null);
  const [leaves, setLeaves] = useState<LeavesData | null>(null);
  const [flowersFruits, setFlowersFruits] = useState<FlowersFruitsData | null>(null);
  const [cultivation, setCultivation] = useState<CultivationData | null>(null);

  useEffect(() => {
    async function loadAllData() {
      if (!id) return;
      try {
        let cleanId = String(id).trim();
        if (/^\d+$/.test(cleanId)) {
          cleanId = `P${cleanId.padStart(3, '0')}`;
        }

        const plantRes = await db.getFirstAsync<PlantData>('SELECT * FROM plants WHERE id = ?', cleanId);
        setPlant(plantRes);

        if (plantRes) {
          const [rsRes, lfRes, ffRes, cultRes] = await Promise.all([
            db.getFirstAsync<RootsStemsData>('SELECT * FROM plant_roots_stems WHERE plant_id = ?', cleanId),
            db.getFirstAsync<LeavesData>('SELECT * FROM plant_leaves WHERE plant_id = ?', cleanId),
            db.getFirstAsync<FlowersFruitsData>('SELECT * FROM plant_flowers_fruits WHERE plant_id = ?', cleanId),
            db.getFirstAsync<CultivationData>('SELECT * FROM plant_cultivation WHERE plant_id = ?', cleanId),
          ]);

          setRootsStems(rsRes);
          setLeaves(lfRes);
          setFlowersFruits(ffRes);
          setCultivation(cultRes);
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes da planta:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, [id, db, dataVersion]);

  const currentTheme = getThemeForHabit(plant?.habito);
  const displayName = plant ? (plant.nomes_populares || plant.nome_cientifico) : '';
  const fruitInfo = flowersFruits?.fruto_tipo || flowersFruits?.fruto_categoria;
  const habitLabel = plant?.habito || 'Espécie Botânica';
  const locationLabel = plant?.localizacao || plant?.colecao_canteiro;

  const renderField = (label: string, value: string | null | undefined) => {
    if (!value || value.trim() === '') return null;
    return (
      <View style={styles.fieldRow} key={label}>
        <Text variant="labelMedium" style={styles.fieldLabel}>{label}</Text>
        <Text variant="bodyMedium" style={styles.fieldValue}>{value}</Text>
      </View>
    );
  };

  const exportPDF = async () => {
    if (!plant) return;
    try {
      const renderPdfRow = (label: string, val: string | null | undefined) => {
        if (!val || !val.trim()) return '';
        return `<tr><td style="padding: 6px 10px; font-weight: bold; width: 35%; color: ${currentTheme.primary}; border-bottom: 1px solid #e0e0e0;">${label}</td><td style="padding: 6px 10px; border-bottom: 1px solid #e0e0e0;">${val}</td></tr>`;
      };

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 25px; color: #333; }
              .header { border-bottom: 3px solid ${currentTheme.primary}; padding-bottom: 15px; margin-bottom: 20px; }
              h1 { color: ${currentTheme.primary}; font-size: 26px; margin: 0 0 4px 0; }
              h2 { font-style: italic; color: #555; font-size: 18px; margin: 0 0 10px 0; }
              .badge { display: inline-block; background-color: ${currentTheme.badgeBg}; color: ${currentTheme.badgeText}; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px; margin-bottom: 8px; }
              .section-title { background-color: ${currentTheme.primary}; color: white; padding: 6px 12px; font-size: 14px; font-weight: bold; border-radius: 4px; margin-top: 18px; margin-bottom: 8px; }
              table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px; }
              .footer { text-align: center; margin-top: 35px; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <span class="badge">${plant.id} — ${habitLabel}</span>
              <h1>${displayName}</h1>
              <h2>${plant.nome_cientifico} ${plant.autor_nome ? `<small>(${plant.autor_nome})</small>` : ''}</h2>
              <p style="margin: 0; color: #666; font-size: 13px;">
                <strong>Família:</strong> ${plant.familia || 'Não informada'} | 
                <strong>Hábito:</strong> ${habitLabel} | 
                <strong>Localização:</strong> ${locationLabel || 'Campus IFMS'}
              </p>
            </div>

            <div class="section-title">1. Informações Gerais e Taxonomia</div>
            <table>
              ${renderPdfRow('Grupo Taxonômico', plant.grupo_taxonomico)}
              ${renderPdfRow('Porte / Altura', plant.porte_altura)}
              ${renderPdfRow('Ciclo de Vida', plant.ciclo_vida)}
              ${renderPdfRow('Origem Biogeográfica', plant.origem_biogeografica)}
              ${renderPdfRow('Status de Ocorrência', plant.status_ocorrencia)}
              ${renderPdfRow('Localização no Campus', locationLabel)}
              ${renderPdfRow('Coordenadas GPS', plant.coordenadas)}
              ${renderPdfRow('Observações', plant.observacoes)}
            </table>

            ${rootsStems ? `
              <div class="section-title">2. Raiz e Caule</div>
              <table>
                ${renderPdfRow('Sistema Radicular', rootsStems.sistema_radicular)}
                ${renderPdfRow('Habitat da Raiz', rootsStems.habitat_raiz)}
                ${renderPdfRow('Raízes Adventícias', rootsStems.raizes_adventicias)}
                ${renderPdfRow('Modificação da Raiz', rootsStems.modificacao_raiz)}
                ${renderPdfRow('Posição do Caule', rootsStems.posicao_caule)}
                ${renderPdfRow('Tipo de Caule', rootsStems.tipo_caule)}
                ${renderPdfRow('Consistência do Caule', rootsStems.consistencia_caule)}
                ${renderPdfRow('Estrutura de Reserva', rootsStems.estrutura_reserva)}
                ${renderPdfRow('Estruturas de Fixação', rootsStems.estruturas_fixacao)}
                ${renderPdfRow('Espinhos / Acúleos', rootsStems.espinhos_aculeos)}
                ${renderPdfRow('Observações', rootsStems.observacoes)}
              </table>
            ` : ''}

            ${leaves ? `
              <div class="section-title">3. Folhas</div>
              <table>
                ${renderPdfRow('Composição', leaves.composicao)}
                ${renderPdfRow('Filotaxia', leaves.filotaxia)}
                ${renderPdfRow('Inserção', leaves.insercao)}
                ${renderPdfRow('Forma do Limbo', leaves.limbo_forma)}
                ${renderPdfRow('Ápice do Limbo', leaves.limbo_apice)}
                ${renderPdfRow('Base do Limbo', leaves.limbo_base)}
                ${renderPdfRow('Margem do Limbo', leaves.limbo_margem)}
                ${renderPdfRow('Nervação', leaves.nervacao)}
                ${renderPdfRow('Indumento', leaves.indumento)}
                ${renderPdfRow('Consistência', leaves.consistencia)}
                ${renderPdfRow('Folha Composta', leaves.folha_composta_tipo)}
                ${renderPdfRow('Nº de Folíolos', leaves.num_foliolos)}
                ${renderPdfRow('Dimensões', leaves.dimensoes)}
                ${renderPdfRow('Observações', leaves.observacoes)}
              </table>
            ` : ''}

            ${flowersFruits ? `
              <div class="section-title">4. Flor e Fruto</div>
              <table>
                ${renderPdfRow('Inflorescência', flowersFruits.inflorescencia)}
                ${renderPdfRow('Sexo da Flor', flowersFruits.flor_sexo)}
                ${renderPdfRow('Simetria Floral', flowersFruits.flor_simetria)}
                ${renderPdfRow('Perianto', flowersFruits.perianto)}
                ${renderPdfRow('Androceu / Estames', flowersFruits.androceu_num_estames)}
                ${renderPdfRow('Ovário', flowersFruits.ovario)}
                ${renderPdfRow('Fruto: Categoria', flowersFruits.fruto_categoria)}
                ${renderPdfRow('Fruto: Tipo', flowersFruits.fruto_tipo)}
                ${renderPdfRow('Consistência', flowersFruits.fruto_consistencia)}
                ${renderPdfRow('Nº de Sementes', flowersFruits.num_sementes)}
                ${renderPdfRow('Dispersão', flowersFruits.dispersao)}
                ${renderPdfRow('Época de Floração', flowersFruits.epoca_floracao)}
                ${renderPdfRow('Época de Frutificação', flowersFruits.epoca_frutificacao)}
                ${renderPdfRow('Observações', flowersFruits.observacoes)}
              </table>
            ` : ''}

            ${cultivation ? `
              <div class="section-title">5. Cultivo e Usos</div>
              <table>
                ${renderPdfRow('Luminosidade', cultivation.luminosidade)}
                ${renderPdfRow('Necessidade Hídrica', cultivation.necessidade_hidrica)}
                ${renderPdfRow('Solo / Substrato', cultivation.tipo_solo_substrato)}
                ${renderPdfRow('pH Ideal', cultivation.ph)}
                ${renderPdfRow('Tolerância ao Frio', cultivation.tolerancia_frio)}
                ${renderPdfRow('Tolerância à Seca', cultivation.tolerancia_seca)}
                ${renderPdfRow('Propagação Principal', cultivation.propagacao_principal)}
                ${renderPdfRow('Uso Principal', cultivation.uso_principal)}
                ${renderPdfRow('Outros Usos', cultivation.outros_usos)}
                ${renderPdfRow('Observações', cultivation.observacoes)}
              </table>
            ` : ''}

            <div class="footer">
              <p>Ficha Botânica gerada pelo aplicativo <strong>Ka'avoHeka</strong></p>
              <p>Instituto Federal de Mato Grosso do Sul — Campus Ponta Porã</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Compartilhar Ficha da Planta' });
    } catch (error) {
      console.error('Erro ao gerar PDF', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: currentTheme.primary }}>
          <Appbar.BackAction onPress={() => router.back()} color="#fff" />
          <Appbar.Content title="Espécie não encontrada" titleStyle={{ color: '#fff' }} />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text variant="bodyLarge">A espécie solicitada não consta na base de dados.</Text>
          <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 20 }} buttonColor={currentTheme.primary}>
            Voltar ao Catálogo
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho com a cor temática do hábito (azul p/ ervas, amarelo p/ arbustos, verde p/ árvores...) */}
      <Appbar.Header style={{ backgroundColor: currentTheme.primary }}>
        <Appbar.BackAction onPress={() => router.back()} color="#fff" />
        <Appbar.Content
          title={displayName}
          subtitle={`${plant.nome_cientifico} • ${habitLabel}`}
          titleStyle={{ color: '#fff', fontWeight: 'bold' }}
          subtitleStyle={{ color: currentTheme.headerSub, fontStyle: 'italic', fontSize: 12 }}
        />
        <Appbar.Action icon="file-pdf-box" color="#fff" onPress={exportPDF} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Card Principal de Identificação */}
        <Card style={styles.mainCard} mode="elevated">
          {plant.foto_principal ? (
            <Image
              source={{ uri: plant.foto_principal }}
              style={styles.image}
              contentFit="cover"
              transition={400}
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: currentTheme.placeholderBg }]}>
              <Text variant="titleMedium" style={{ color: currentTheme.primary, fontWeight: 'bold' }}>
                🌱 {displayName}
              </Text>
              <Text variant="bodySmall" style={{ color: '#555', fontStyle: 'italic', marginTop: 4 }}>
                {plant.nome_cientifico}
              </Text>
            </View>
          )}

          <Card.Content style={{ paddingTop: 16 }}>
            <Badge style={styles.badge}>{plant.id}</Badge>

            {plant.foto_principal &&
              <>
            <View style={styles.titleRow}>
                  <Text variant="headlineSmall" style={styles.popularName}>{displayName}</Text>
            </View>
              <Text variant="titleMedium" style={styles.scientificTitle}>
                {plant.nome_cientifico} {plant.autor_nome ? <Text style={styles.authorText}>({plant.autor_nome})</Text> : null}
              </Text>
              </>}

            {/* Clips Coloridos Pastéis com Alto Contraste */}
            <View style={styles.quickTags}>
              {/* 1. Família (Azul Céu Pastel) */}
              {plant.familia && (
                <Chip
                  icon="tag-outline"
                  style={[styles.pastelChip, styles.familyChip]}
                  textStyle={styles.familyText}
                  compact
                >
                  {plant.familia}
                </Chip>
              )}

              {/* 2. Localização no Campus (Lilás / Lavanda Pastel) */}
              {locationLabel && (
                <Chip
                  icon="map-marker-outline"
                  style={[styles.pastelChip, styles.locationChip]}
                  textStyle={styles.locationText}
                  compact
                >
                  Local: {locationLabel}
                </Chip>
              )}

              {/* 3. Flor / Inflorescência (Rosa Pastel) */}
              {flowersFruits?.inflorescencia && (
                <Chip
                  icon="flower"
                  style={[styles.pastelChip, styles.flowerChip]}
                  textStyle={styles.flowerText}
                  compact
                >
                  Flor: {flowersFruits.inflorescencia}
                </Chip>
              )}

              {/* 4. Fruto (Laranja / Pêssego Pastel) */}
              {fruitInfo && (
                <Chip
                  icon="fruit-cherries"
                  style={[styles.pastelChip, styles.fruitChip]}
                  textStyle={styles.fruitText}
                  compact
                >
                  Fruto: {fruitInfo}
                </Chip>
              )}

              {/* 5. Uso / Cultivo (Verde Menta Pastel) */}
              {cultivation?.uso_principal && (
                <Chip
                  icon="sprout-outline"
                  style={[styles.pastelChip, styles.cultivationChip]}
                  textStyle={styles.cultivationText}
                  compact
                >
                  Uso: {cultivation.uso_principal}
                </Chip>
              )}

              {/* 6. Luminosidade (Amarelo Pastel) */}
              {cultivation?.luminosidade && (
                <Chip
                  icon="weather-sunny"
                  style={[styles.pastelChip, styles.sunChip]}
                  textStyle={styles.sunText}
                  compact
                >
                  {cultivation.luminosidade}
                </Chip>
              )}

              {/* 7. Ciclo de Vida (Cinza Ardósia Pastel) */}
              {plant.ciclo_vida && (
                <Chip
                  icon="timelapse"
                  style={[styles.pastelChip, styles.cycleChip]}
                  textStyle={styles.cycleText}
                  compact
                >
                  Ciclo: {plant.ciclo_vida}
                </Chip>
              )}

              {/* 8. Origem Biogeográfica (Âmbar Suave Pastel) */}
              {plant.origem_biogeografica && (
                <Chip
                  icon="earth"
                  style={[styles.pastelChip, styles.originChip]}
                  textStyle={styles.originText}
                  compact
                >
                  Origem: {plant.origem_biogeografica}
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Seletor de Abas Botânicas com tema dinâmico */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {[
              { id: 'geral', label: 'Geral', icon: 'information' },
              { id: 'raiz_caule', label: 'Raiz & Caule', icon: 'tree' },
              { id: 'folhas', label: 'Folhas', icon: 'leaf' },
              { id: 'flor_fruto', label: 'Flor & Fruto', icon: 'flower' },
              { id: 'cultivo', label: 'Cultivo & Usos', icon: 'sprout' }
            ].map(tab => {
              const isActive = selectedTab === tab.id;
              return (
                <Chip
                  key={tab.id}
                  selected={isActive}
                  onPress={() => setSelectedTab(tab.id)}
                  style={[
                    styles.sectionTab,
                    isActive && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
                  ]}
                  textStyle={isActive ? styles.sectionTabTextActive : styles.sectionTabText}
                  showSelectedOverlay
                >
                  {tab.label}
                </Chip>
              );
            })}
          </ScrollView>
        </View>

        {/* Conteúdo da Aba Selecionada */}
        <Card style={styles.detailsCard} mode="outlined">
          <Card.Content>
            {selectedTab === 'geral' && (
              <View>
                <Text variant="titleMedium" style={[styles.sectionHeader, { color: currentTheme.primary }]}>
                  Classificação e Ocorrência
                </Text>
                {renderField('Gênero', plant.genero)}
                {renderField('Família', plant.familia)}
                {renderField('Grupo Taxonômico', plant.grupo_taxonomico)}
                {renderField('Hábito', plant.habito)}
                {renderField('Porte / Altura', plant.porte_altura)}
                {renderField('Ciclo de Vida', plant.ciclo_vida)}
                {renderField('Origem Biogeográfica', plant.origem_biogeografica)}
                {renderField('Status de Ocorrência', plant.status_ocorrencia)}
                {renderField('Localização no Campus', locationLabel)}
                {renderField('Coleção / Canteiro', plant.colecao_canteiro)}
                {renderField('Coordenadas GPS', plant.coordenadas)}
                {renderField('Observações', plant.observacoes)}
              </View>
            )}

            {selectedTab === 'raiz_caule' && (
              <View>
                <Text variant="titleMedium" style={[styles.sectionHeader, { color: currentTheme.primary }]}>
                  Morfologia de Raiz e Caule
                </Text>
                {rootsStems ? (
                  <>
                    {renderField('Sistema Radicular', rootsStems.sistema_radicular)}
                    {renderField('Habitat da Raiz', rootsStems.habitat_raiz)}
                    {renderField('Raiz Primária', rootsStems.raiz_primaria)}
                    {renderField('Raízes Adventícias', rootsStems.raizes_adventicias)}
                    {renderField('Modificação da Raiz', rootsStems.modificacao_raiz)}
                    {renderField('Gravitropismo', rootsStems.gravitropismo_raiz)}
                    {renderField('Posição do Caule', rootsStems.posicao_caule)}
                    {renderField('Tipo de Caule', rootsStems.tipo_caule)}
                    {renderField('Consistência do Caule', rootsStems.consistencia_caule)}
                    {renderField('Ramificação', rootsStems.ramificacao)}
                    {renderField('Gema Apical', rootsStems.gema_apical)}
                    {renderField('Gemas Axilares', rootsStems.gemas_axilares)}
                    {renderField('Estrutura de Reserva', rootsStems.estrutura_reserva)}
                    {renderField('Estruturas de Fixação', rootsStems.estruturas_fixacao)}
                    {renderField('Espinhos / Acúleos', rootsStems.espinhos_aculeos)}
                    {renderField('Lenticelas', rootsStems.lenticelas)}
                    {renderField('Observações', rootsStems.observacoes)}
                  </>
                ) : (
                  <Text style={styles.emptyField}>Sem registros cadastrados para raiz e caule.</Text>
                )}
              </View>
            )}

            {selectedTab === 'folhas' && (
              <View>
                <Text variant="titleMedium" style={[styles.sectionHeader, { color: currentTheme.primary }]}>
                  Morfologia Foliar
                </Text>
                {leaves ? (
                  <>
                    {renderField('Persistência', leaves.persistencia)}
                    {renderField('Composição', leaves.composicao)}
                    {renderField('Filotaxia', leaves.filotaxia)}
                    {renderField('Inserção', leaves.insercao)}
                    {renderField('Pecíolo', leaves.peciolo)}
                    {renderField('Bainha', leaves.bainha)}
                    {renderField('Lígula', leaves.ligula)}
                    {renderField('Estípula', leaves.estipula)}
                    {renderField('Forma do Limbo', leaves.limbo_forma)}
                    {renderField('Ápice do Limbo', leaves.limbo_apice)}
                    {renderField('Base do Limbo', leaves.limbo_base)}
                    {renderField('Margem do Limbo', leaves.limbo_margem)}
                    {renderField('Nervação', leaves.nervacao)}
                    {renderField('Textura Superficial', leaves.textura_superficial)}
                    {renderField('Indumento', leaves.indumento)}
                    {renderField('Consistência', leaves.consistencia)}
                    {renderField('Cor / Variegação', leaves.cor_variegacao)}
                    {renderField('Dimensões', leaves.dimensoes)}
                    {renderField('Tipo de Folha Composta', leaves.folha_composta_tipo)}
                    {renderField('Nº de Folíolos', leaves.num_foliolos)}
                    {renderField('Forma dos Folíolos', leaves.forma_foliolos)}
                    {renderField('Metamorfose Foliar', leaves.metamorfose_foliar)}
                    {renderField('Gavinhas', leaves.gavinhas)}
                    {renderField('Espinhos Foliares', leaves.espinhos_foliares)}
                    {renderField('Brácteas', leaves.bracteas)}
                    {renderField('Observações', leaves.observacoes)}
                  </>
                ) : (
                  <Text style={styles.emptyField}>Sem registros cadastrados para folhas.</Text>
                )}
              </View>
            )}

            {selectedTab === 'flor_fruto' && (
              <View>
                <Text variant="titleMedium" style={[styles.sectionHeader, { color: currentTheme.primary }]}>
                  Estruturas Reprodutivas
                </Text>
                {flowersFruits ? (
                  <>
                    {renderField('Sexualidade da Planta', flowersFruits.sexualidade_planta)}
                    {renderField('Inflorescência', flowersFruits.inflorescencia)}
                    {renderField('Posição da Inflorescência', flowersFruits.posicao_inflorescencia)}
                    {renderField('Sexo da Flor', flowersFruits.flor_sexo)}
                    {renderField('Simetria Floral', flowersFruits.flor_simetria)}
                    {renderField('Perianto', flowersFruits.perianto)}
                    {renderField('Cálice', flowersFruits.calice)}
                    {renderField('Corola', flowersFruits.corola)}
                    {renderField('Androceu / Estames', flowersFruits.androceu_num_estames)}
                    {renderField('Ovário', flowersFruits.ovario)}
                    {renderField('Placentação', flowersFruits.placentacao)}
                    {renderField('Época de Floração', flowersFruits.epoca_floracao)}
                    {renderField('Polinizadores', flowersFruits.polinizadores)}
                    {renderField('Fruto: Categoria', flowersFruits.fruto_categoria)}
                    {renderField('Fruto: Consistência', flowersFruits.fruto_consistencia)}
                    {renderField('Fruto: Deiscência', flowersFruits.fruto_deiscencia)}
                    {renderField('Fruto: Tipo', flowersFruits.fruto_tipo)}
                    {renderField('Nº de Sementes', flowersFruits.num_sementes)}
                    {renderField('Dispersão', flowersFruits.dispersao)}
                    {renderField('Pseudofruto', flowersFruits.pseudofruto)}
                    {renderField('Época de Frutificação', flowersFruits.epoca_frutificacao)}
                    {renderField('Observações', flowersFruits.observacoes)}
                  </>
                ) : (
                  <Text style={styles.emptyField}>Sem registros cadastrados para flor e fruto.</Text>
                )}
              </View>
            )}

            {selectedTab === 'cultivo' && (
              <View>
                <Text variant="titleMedium" style={[styles.sectionHeader, { color: currentTheme.primary }]}>
                  Requisitos de Cultivo e Usos
                </Text>
                {cultivation ? (
                  <>
                    {renderField('Clima', cultivation.clima)}
                    {renderField('Faixa de Temperatura', cultivation.faixa_temperatura)}
                    {renderField('Luminosidade', cultivation.luminosidade)}
                    {renderField('Necessidade Hídrica', cultivation.necessidade_hidrica)}
                    {renderField('Umidade do Ar', cultivation.umidade_ar)}
                    {renderField('Tipo de Solo / Substrato', cultivation.tipo_solo_substrato)}
                    {renderField('Drenagem', cultivation.drenagem)}
                    {renderField('pH Ideal', cultivation.ph)}
                    {renderField('Fertilidade', cultivation.fertilidade)}
                    {renderField('Tolerância ao Frio', cultivation.tolerancia_frio)}
                    {renderField('Tolerância à Seca', cultivation.tolerancia_seca)}
                    {renderField('Tolerância a Encharcamento', cultivation.tolerancia_encharcamento)}
                    {renderField('Propagação Principal', cultivation.propagacao_principal)}
                    {renderField('Outras Formas de Propagação', cultivation.outras_propagacoes)}
                    {renderField('Poda / Manutenção', cultivation.poda_manutencao)}
                    {renderField('Pragas Observadas', cultivation.pragas_observadas)}
                    {renderField('Doenças Observadas', cultivation.doencas_observadas)}
                    {renderField('Toxicidade', cultivation.toxicidade)}
                    {renderField('Uso Principal', cultivation.uso_principal)}
                    {renderField('Outros Usos', cultivation.outros_usos)}
                    {renderField('Exigências Edafoclimáticas', cultivation.exigencias_edafoclimaticas)}
                    {renderField('Adaptação Regional', cultivation.adaptacao_regional)}
                    {renderField('Observações', cultivation.observacoes)}
                  </>
                ) : (
                  <Text style={styles.emptyField}>Sem registros cadastrados para cultivo.</Text>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Botão de Exportação em PDF com cor temática */}
        <Button
          mode="contained"
          icon="file-pdf-box"
          onPress={exportPDF}
          style={styles.pdfButton}
          contentStyle={{ height: 48 }}
          buttonColor={currentTheme.primary}
        >
          Exportar Ficha Técnica Completa em PDF
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  mainCard: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 16, elevation: 2 },
  image: { width: '100%', height: 220, backgroundColor: '#e0e0e0' },
  placeholderImage: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap' },
  popularName: { fontWeight: 'bold', flex: 1, marginRight: 8, textTransform: 'capitalize', fontSize: 20 },
  typeBadge: {
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    lineHeight: 22,
    textTransform: 'capitalize',
  },
  scientificRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, marginBottom: 12 },
  scientificTitle: { fontStyle: 'italic', color: '#555', fontSize: 14, flex: 1 },
  authorText: { fontStyle: 'normal', color: '#888', fontSize: 12 },
  codeText: { color: '#888', fontWeight: 'bold', fontSize: 11, backgroundColor: '#f0f0f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  quickTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  badge: { backgroundColor: '#32A041', color: '#fff', fontWeight: 'bold', fontSize: 13, paddingHorizontal: 6 },

  /* Estilos Base para Chips Pastéis */
  pastelChip: {
    borderRadius: 8,
    height: 28,
  },

  /* 1. Família (Azul Céu Pastel com Azul Escuro) */
  familyChip: { backgroundColor: '#E0F2FE' },
  familyText: { fontSize: 11, color: '#0369A1', fontWeight: '600' },

  /* 2. Localização (Lilás / Lavanda Pastel com Roxo Escuro) */
  locationChip: { backgroundColor: '#EDE9FE' },
  locationText: { fontSize: 11, color: '#5B21B6', fontWeight: '600' },

  /* 3. Flor (Rosa Pastel com Bordô Escuro) */
  flowerChip: { backgroundColor: '#FCE7F3' },
  flowerText: { fontSize: 11, color: '#9D174D', fontWeight: '600' },

  /* 4. Fruto (Pêssego Pastel com Terracota Escuro) */
  fruitChip: { backgroundColor: '#FFEDD5' },
  fruitText: { fontSize: 11, color: '#9A3412', fontWeight: '600' },

  /* 5. Cultivo / Uso (Verde Menta Pastel com Floresta Escuro) */
  cultivationChip: { backgroundColor: '#DCFCE7' },
  cultivationText: { fontSize: 11, color: '#15803D', fontWeight: '600' },

  /* 6. Sol / Luminosidade (Amarelo Pastel com Marrom Ocre Escuro) */
  sunChip: { backgroundColor: '#FEF9C3' },
  sunText: { fontSize: 11, color: '#854D0E', fontWeight: '600' },

  /* 7. Ciclo (Cinza Ardósia Pastel com Ardósia Escuro) */
  cycleChip: { backgroundColor: '#F1F5F9' },
  cycleText: { fontSize: 11, color: '#334155', fontWeight: '600' },

  /* 8. Origem (Âmbar Suave Pastel com Terracota Escuro) */
  originChip: { backgroundColor: '#FEF3C7' },
  originText: { fontSize: 11, color: '#92400E', fontWeight: '600' },

  tabsContainer: { marginBottom: 12 },
  tabsScroll: { gap: 8 },
  sectionTab: { backgroundColor: '#fff', borderColor: '#ccc' },
  sectionTabText: { color: '#555', fontSize: 13 },
  sectionTabTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  detailsCard: { backgroundColor: '#fff', borderRadius: 12, borderColor: '#e0e0e0' },
  sectionHeader: { fontWeight: 'bold', marginBottom: 12, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 6 },
  fieldRow: { marginBottom: 10, paddingBottom: 6, borderBottomWidth: 1, borderColor: '#f5f5f5' },
  fieldLabel: { color: '#777', fontWeight: '600', marginBottom: 2 },
  fieldValue: { color: '#222', fontSize: 14, lineHeight: 20 },
  emptyField: { color: '#999', fontStyle: 'italic', marginVertical: 10 },
  pdfButton: { marginTop: 20, borderRadius: 8 }
});
