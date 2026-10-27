import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { Appbar, Searchbar, Card, Text, Chip, Badge } from 'react-native-paper';
import { useSync } from '../../database/SyncProvider';

type Plant = {
  id: string;
  nome_cientifico: string;
  nomes_populares: string | null;
  familia: string | null;
  habito: string | null;
  grupo_taxonomico: string | null;
  inflorescencia: string | null;
  fruto_tipo: string | null;
  fruto_categoria: string | null;
  uso_principal: string | null;
  luminosidade: string | null;
};

type FilterTheme = {
  primary: string;
  titleColor: string;
  accent: string;
  filterChipBg: string;
  filterChipText: string;
  badgeBg: string;
  badgeText: string;
};

const THEMES: Record<string, FilterTheme> = {
  Todos: {
    primary: '#2E7D32',        // Verde Botânico
    titleColor: '#2E7D32',
    accent: '#1B5E20',
    filterChipBg: '#2E7D32',
    filterChipText: '#FFFFFF',
    badgeBg: '#E8F5E9',
    badgeText: '#1B5E20',
  },
  'Árvore': {
    primary: '#1B5E20',        // Verde Floresta profundo
    titleColor: '#1B5E20',
    accent: '#0D3C12',
    filterChipBg: '#1B5E20',
    filterChipText: '#FFFFFF',
    badgeBg: '#E8F5E9',
    badgeText: '#1B5E20',
  },
  'Arbusto': {
    primary: '#B45309',        // Amarelo Dourado / Âmbar de alto contraste
    titleColor: '#B45309',
    accent: '#78350F',
    filterChipBg: '#B45309',
    filterChipText: '#FFFFFF',
    badgeBg: '#FEF3C7',
    badgeText: '#78350F',
  },
  'Erva': {
    primary: '#1565C0',        // Azul Safira
    titleColor: '#1565C0',
    accent: '#0D47A1',
    filterChipBg: '#1565C0',
    filterChipText: '#FFFFFF',
    badgeBg: '#E3F2FD',
    badgeText: '#0D47A1',
  },
  'Subarbusto': {
    primary: '#6A1B9A',        // Roxo Profundo
    titleColor: '#6A1B9A',
    accent: '#4A148C',
    filterChipBg: '#6A1B9A',
    filterChipText: '#FFFFFF',
    badgeBg: '#F3E5F5',
    badgeText: '#4A148C',
  },
  'Trepadeira': {
    primary: '#00695C',        // Teal / Verde Petróleo
    titleColor: '#00695C',
    accent: '#004D40',
    filterChipBg: '#00695C',
    filterChipText: '#FFFFFF',
    badgeBg: '#E0F2F1',
    badgeText: '#004D40',
  },
};

const HABIT_FILTERS = ['Todos', 'Árvore', 'Arbusto', 'Erva', 'Subarbusto', 'Trepadeira'];

export default function CatalogoScreen() {
  const db = useSQLiteContext();
  const { dataVersion, syncing, syncNow } = useSync();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [search, setSearch] = useState('');
  const [selectedHabit, setSelectedHabit] = useState('Todos');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const currentTheme = THEMES[selectedHabit] || THEMES.Todos;

  useEffect(() => {
    let isMounted = true;

    async function fetchPlants() {
      try {
        let query = `
          SELECT 
            p.id, 
            p.nome_cientifico, 
            p.nomes_populares, 
            p.familia, 
            p.habito, 
            p.grupo_taxonomico,
            ff.inflorescencia,
            ff.fruto_tipo,
            ff.fruto_categoria,
            c.uso_principal,
            c.luminosidade
          FROM plants p
          LEFT JOIN plant_flowers_fruits ff ON ff.plant_id = p.id
          LEFT JOIN plant_cultivation c ON c.plant_id = p.id
          WHERE 1=1
        `;
        const params: string[] = [];

        if (search.trim() !== '') {
          const term = `%${search.trim()}%`;
          query += ` AND (p.nomes_populares LIKE ? OR p.nome_cientifico LIKE ? OR p.familia LIKE ? OR p.id LIKE ?)`;
          params.push(term, term, term, term);
        }

        if (selectedHabit !== 'Todos') {
          query += ` AND p.habito LIKE ?`;
          params.push(`%${selectedHabit}%`);
        }

        query += ` ORDER BY COALESCE(p.nomes_populares, p.nome_cientifico) ASC`;

        const result = await db.getAllAsync<Plant>(query, ...params);
        if (isMounted) {
          setPlants(result);
        }
      } catch (error) {
        console.error('Erro ao buscar plantas:', error);
      }
    }

    fetchPlants();

    return () => {
      isMounted = false;
    };
  }, [db, search, selectedHabit, dataVersion]);

  return (
    <View style={styles.container}>
      {/* Cabeçalho com cor dinâmica do filtro selecionado */}
      {isSearchVisible ? (
        <Appbar.Header style={{ backgroundColor: currentTheme.primary }}>
          <Searchbar
            placeholder="Buscar por nome, família ou código..."
            onChangeText={setSearch}
            value={search}
            style={styles.searchbar}
            autoFocus
            icon="arrow-left"
            onIconPress={() => {
              setIsSearchVisible(false);
              setSearch('');
            }}
          />
        </Appbar.Header>
      ) : (
        <Appbar.Header style={{ backgroundColor: currentTheme.primary }}>
          <Appbar.Content
            title="BuscaKa'avo - Catálogo"
            subtitle={selectedHabit !== 'Todos' ? `Filtro ativo: ${selectedHabit}` : 'Espécies do Campus'}
            titleStyle={{ color: '#fff', fontWeight: 'bold' }}
            subtitleStyle={{ color: '#ffffffdd', fontSize: 12 }}
          />
          <Appbar.Action
            icon={syncing ? 'cloud-sync' : 'cloud-refresh'}
            color="#fff"
            disabled={syncing}
            onPress={syncNow}
            accessibilityLabel="Sincronizar dados com o servidor"
          />
          <Appbar.Action icon="magnify" color="#fff" onPress={() => setIsSearchVisible(true)} />
        </Appbar.Header>
      )}

      {/* Barra de Filtros Rápidos com transição temática */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {HABIT_FILTERS.map((habit) => {
            const isSelected = selectedHabit === habit;
            const habitTheme = THEMES[habit] || THEMES.Todos;
            return (
              <Chip
                key={habit}
                selected={isSelected}
                onPress={() => setSelectedHabit(habit)}
                style={[
                  styles.filterChip,
                  isSelected && { backgroundColor: habitTheme.filterChipBg }
                ]}
                textStyle={[
                  styles.filterChipText,
                  isSelected && { color: habitTheme.filterChipText, fontWeight: 'bold' }
                ]}
                compact
              >
                {habit}
              </Chip>
            );
          })}
        </ScrollView>
      </View>

      {/* Contagem de Resultados com indicador temático */}
      <View style={styles.resultCountRow}>
        <Text variant="bodySmall" style={styles.resultCountText}>
          {plants.length} {plants.length === 1 ? 'espécie encontrada' : 'espécies encontradas'}
        </Text>
      </View>

      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 25 }}
        renderItem={({ item }) => {
          const displayName = item.nomes_populares || item.nome_cientifico;
          const fruitInfo = item.fruto_tipo || item.fruto_categoria;
          const habitLabel = item.habito || 'Planta';

          return (
            <Link href={`/plant/${item.id}`} asChild>
              <TouchableOpacity activeOpacity={0.8}>
                <Card style={styles.card} mode="elevated">
                  <Card.Content>
                    {/* Header do Card: Nome e Tipo da Planta (em vez de P001 a P133) */}
                    <View style={styles.cardHeader}>
                      <Text
                        variant="titleMedium"
                        style={[styles.plantTitle, { color: currentTheme.titleColor }]}
                        numberOfLines={1}
                      >
                        {displayName}
                      </Text>
                      <Badge style={[styles.typeBadge, { backgroundColor: currentTheme.badgeBg, color: currentTheme.badgeText }]}>
                        {habitLabel}
                      </Badge>
                    </View>

                    {/* Nome Científico em Itálico */}
                    <Text variant="bodyMedium" style={styles.scientificName} numberOfLines={1}>
                      {item.nome_cientifico}
                    </Text>

                    {/* Clips em Cores Pastéis com Alto Contraste */}
                    <View style={styles.tagRow}>
                      {/* Clip 1: Família Botânica (Azul Pastel) */}
                      {item.familia && (
                        <Chip
                          icon="tag-outline"
                          style={[styles.pastelChip, styles.familyChip]}
                          textStyle={styles.familyText}
                          compact
                        >
                          {item.familia}
                        </Chip>
                      )}

                      {/* Clip 2: Flores / Inflorescência (Rosa Pastel) */}
                      {item.inflorescencia ? (
                        <Chip
                          icon="flower"
                          style={[styles.pastelChip, styles.flowerChip]}
                          textStyle={styles.flowerText}
                          compact
                        >
                          Flor: {item.inflorescencia}
                        </Chip>
                      ) : null}

                      {/* Clip 3: Frutos (Laranja / Pêssego Pastel) */}
                      {fruitInfo ? (
                        <Chip
                          icon="fruit-cherries"
                          style={[styles.pastelChip, styles.fruitChip]}
                          textStyle={styles.fruitText}
                          compact
                        >
                          Fruto: {fruitInfo}
                        </Chip>
                      ) : null}

                      {/* Clip 4: Cultivo / Uso Principal (Verde Pastel) */}
                      {item.uso_principal && (
                        <Chip
                          icon="sprout-outline"
                          style={[styles.pastelChip, styles.cultivationChip]}
                          textStyle={styles.cultivationText}
                          compact
                        >
                          Uso: {item.uso_principal}
                        </Chip>
                      )}

                      {/* Clip 5: Luminosidade (Amarelo Pastel) */}
                      {item.luminosidade && (
                        <Chip
                          icon="weather-sunny"
                          style={[styles.pastelChip, styles.sunChip]}
                          textStyle={styles.sunText}
                          compact
                        >
                          {item.luminosidade}
                        </Chip>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            </Link>
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma espécie botânica encontrada.</Text>
            {(search !== '' || selectedHabit !== 'Todos') && (
              <Chip
                style={{ marginTop: 15 }}
                icon="close"
                onPress={() => {
                  setSearch('');
                  setSelectedHabit('Todos');
                }}
              >
                Limpar filtros
              </Chip>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f8' },
  searchbar: { flex: 1, backgroundColor: '#fff', marginHorizontal: 8, elevation: 0 },
  filterContainer: { backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  filterScroll: { paddingHorizontal: 15, gap: 8 },
  filterChip: { backgroundColor: '#f0f0f0' },
  filterChipText: { color: '#555', fontSize: 13 },
  resultCountRow: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 6 },
  resultCountText: { color: '#777', fontWeight: '500' },
  card: { marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plantTitle: { fontWeight: 'bold', flex: 1, marginRight: 8, textTransform: 'capitalize', fontSize: 17 },
  typeBadge: {
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    lineHeight: 22,
    textTransform: 'capitalize',
  },
  scientificName: { fontStyle: 'italic', color: '#666', marginTop: 2, marginBottom: 8, fontSize: 13 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },

  /* Estilos Base para Chips Pastéis */
  pastelChip: {
    borderRadius: 8,
    height: 28,
  },

  /* 1. Família (Azul Céu Pastel com Azul Escuro) */
  familyChip: { backgroundColor: '#E0F2FE' },
  familyText: { fontSize: 11, color: '#0369A1', fontWeight: '600' },

  /* 2. Flor (Rosa Pastel com Bordô Escuro) */
  flowerChip: { backgroundColor: '#FCE7F3' },
  flowerText: { fontSize: 11, color: '#9D174D', fontWeight: '600' },

  /* 3. Fruto (Pêssego Pastel com Terracota Escuro) */
  fruitChip: { backgroundColor: '#FFEDD5' },
  fruitText: { fontSize: 11, color: '#9A3412', fontWeight: '600' },

  /* 4. Cultivo / Uso (Verde Menta Pastel com Floresta Escuro) */
  cultivationChip: { backgroundColor: '#DCFCE7' },
  cultivationText: { fontSize: 11, color: '#15803D', fontWeight: '600' },

  /* 5. Sol / Luminosidade (Amarelo Pastel com Marrom Ocre Escuro) */
  sunChip: { backgroundColor: '#FEF9C3' },
  sunText: { fontSize: 11, color: '#854D0E', fontWeight: '600' },

  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', color: '#888', fontStyle: 'italic', fontSize: 15 }
});
