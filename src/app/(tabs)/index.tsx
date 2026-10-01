import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { Appbar, Searchbar, Card, Text } from 'react-native-paper';

type Plant = {
  id: string;
  nomePopular: string;
  nomeCientifico: string;
  familia: string;
};

export default function CatálogoScreen() {
  const db = useSQLiteContext();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [search, setSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    loadPlants();
  }, [search]);

  const loadPlants = async () => {
    try {
      if (search.trim() === '') {
        const result = await db.getAllAsync<Plant>('SELECT id, nomePopular, nomeCientifico, familia FROM plants ORDER BY nomePopular');
        setPlants(result);
      } else {
        const searchTerm = `%${search}%`;
        const result = await db.getAllAsync<Plant>(
          'SELECT id, nomePopular, nomeCientifico, familia FROM plants WHERE nomePopular LIKE ? OR nomeCientifico LIKE ? ORDER BY nomePopular',
          searchTerm, searchTerm
        );
        setPlants(result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {isSearchVisible ? (
        <Appbar.Header style={{ backgroundColor: '#32A041' }}>
          <Searchbar
            placeholder="Buscar plantas..."
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
        <Appbar.Header style={{ backgroundColor: '#32A041' }}>
          <Appbar.Content title="Ka'avoHeka - Catálogo" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
          <Appbar.Action icon="magnify" color="#fff" onPress={() => setIsSearchVisible(true)} />
        </Appbar.Header>
      )}

      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Link href={`/plant/${item.id}`} asChild>
            <TouchableOpacity>
              <Card style={styles.card} mode="elevated">
                <Card.Content>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#333' }}>{item.nomePopular}</Text>
                  <Text variant="bodyMedium" style={{ fontStyle: 'italic', color: '#666' }}>{item.nomeCientifico}</Text>
                  <Text variant="bodySmall" style={{ marginTop: 5, color: '#888' }}>Família: {item.familia}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhuma planta encontrada.</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchbar: { flex: 1, backgroundColor: '#fff', marginHorizontal: 8, elevation: 0 },
  card: { marginBottom: 12, backgroundColor: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888', fontStyle: 'italic' }
});
