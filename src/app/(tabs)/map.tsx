import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Text, Card, Chip, IconButton, Badge } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';

type CampusArea = {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string | null;
  cor: string | null;
  icone: string | null;
  total_exemplares: number;
};

export default function MapScreen() {
  const db = useSQLiteContext();
  const [areas, setAreas] = useState<CampusArea[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchAreas() {
      try {
        const result = await db.getAllAsync<CampusArea>(`
          SELECT a.id, a.nome, a.descricao, a.tipo, a.cor, a.icone,
                 COUNT(pl.id) as total_exemplares
          FROM areas a
          LEFT JOIN plant_locations pl ON pl.area_id = a.id
          GROUP BY a.id
          ORDER BY a.nome ASC
        `);
        if (isMounted) {
          setAreas(result);
        }
      } catch (error) {
        console.error('Erro ao carregar áreas do campus:', error);
      }
    }

    fetchAreas();

    return () => {
      isMounted = false;
    };
  }, [db]);

  const getIconName = (icone: string | null, tipo: string | null) => {
    if (icone) return icone;
    switch (tipo) {
      case 'pomar': return 'fruit-cherries';
      case 'viveiro': return 'flower';
      case 'horta': return 'carrot';
      case 'patio': return 'domain';
      default: return 'tree';
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#32A041' }}>
        <Appbar.Content title="Ka'avoHeka - Setores do Campus" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
      </Appbar.Header>

      <FlatList
        data={areas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        ListHeaderComponent={
          <View style={styles.headerBox}>
            <View style={styles.infoBanner}>
              <IconButton icon="information-outline" iconColor="#155724" size={24} style={{ margin: 0 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text variant="titleSmall" style={{ color: '#155724', fontWeight: 'bold' }}>
                  Grandes Áreas do Campus
                </Text>
                <Text variant="bodySmall" style={{ color: '#1b5e20', marginTop: 2, lineHeight: 18 }}>
                  O campus do IFMS é dividido em setores para facilitar a orientação de campo. As plantas possuem tags físicas e QR Codes fixados em cada área.
                </Text>
              </View>
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Setores Mapeados ({areas.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const areaColor = item.cor || '#32A041';
          return (
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: areaColor + '20' }]}>
                    <IconButton
                      icon={getIconName(item.icone, item.tipo)}
                      iconColor={areaColor}
                      size={24}
                      style={{ margin: 0 }}
                    />
                  </View>
                  <View style={styles.headerText}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text variant="titleMedium" style={styles.areaTitle}>{item.nome}</Text>
                      <Badge style={[styles.codeBadge, { backgroundColor: areaColor + '15', color: areaColor }]}>
                        {item.id}
                      </Badge>
                    </View>
                    <Text variant="bodySmall" style={styles.areaType}>Tipo: {item.tipo || 'Setor'}</Text>
                  </View>
                </View>

                {item.descricao && (
                  <Text variant="bodyMedium" style={styles.areaDesc}>
                    {item.descricao}
                  </Text>
                )}

                <View style={styles.footerRow}>
                  <Chip icon="map-marker-radius" style={styles.tagChip} compact>
                    {item.total_exemplares} {item.total_exemplares === 1 ? 'exemplar georreferenciado' : 'exemplares georreferenciados'}
                  </Chip>
                </View>
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerBox: { marginBottom: 14 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d4edda',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb',
    marginBottom: 16
  },
  sectionTitle: { fontWeight: 'bold', color: '#333' },
  card: { marginBottom: 14, backgroundColor: '#fff', borderRadius: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1, marginLeft: 12 },
  areaTitle: { fontWeight: 'bold', color: '#222' },
  codeBadge: { fontWeight: 'bold', fontSize: 11 },
  areaType: { color: '#777', textTransform: 'capitalize' },
  areaDesc: { color: '#555', marginTop: 10, lineHeight: 20 },
  footerRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  tagChip: { backgroundColor: '#f1f8e9' }
});
