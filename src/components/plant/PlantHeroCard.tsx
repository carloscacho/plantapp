import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Badge } from 'react-native-paper';
import { Image } from 'expo-image';
import {
  PlantData,
  FlowersFruitsData,
  CultivationData,
  PlantTheme,
} from '../../types/plant';
import { PlantPastelChips } from './PlantPastelChips';

type PlantHeroCardProps = {
  plant: PlantData;
  flowersFruits: FlowersFruitsData | null;
  cultivation: CultivationData | null;
  theme: PlantTheme;
};

export function PlantHeroCard({
  plant,
  flowersFruits,
  cultivation,
  theme,
}: PlantHeroCardProps) {
  const displayName = plant.nomes_populares || plant.nome_cientifico;
  const habitLabel = plant.habito || 'Planta';

  return (
    <Card style={styles.mainCard} mode="elevated">
      {plant.foto_principal ? (
        <Image
          source={{ uri: plant.foto_principal }}
          style={styles.image}
          contentFit="cover"
          transition={400}
        />
      ) : (
        <View style={[styles.placeholderImage, { backgroundColor: theme.placeholderBg }]}>
          <Text variant="titleMedium" style={{ color: theme.primary, fontWeight: 'bold' }}>
            🌱 {displayName}
          </Text>
          <Text variant="bodySmall" style={{ color: '#555', fontStyle: 'italic', marginTop: 4 }}>
            {plant.nome_cientifico}
          </Text>
        </View>
      )}

      <Card.Content style={{ paddingTop: 16 }}>
        {/* Badges de Identificação e Hábito */}
        <View style={styles.badgeRow}>
          <Badge style={[styles.idBadge, { backgroundColor: theme.primary }]}>
            {plant.id}
          </Badge>
          <Badge style={[styles.habitBadge, { backgroundColor: theme.badgeBg, color: theme.badgeText }]}>
            {habitLabel}
          </Badge>
        </View>

        {/* Informações de Título e Nomes (sempre visíveis para boa usabilidade) */}
        <View style={styles.titleRow}>
          <Text variant="headlineSmall" style={[styles.popularName, { color: theme.titleColor }]}>
            {displayName}
          </Text>
        </View>

        <Text variant="titleMedium" style={styles.scientificTitle}>
          {plant.nome_cientifico}{' '}
          {plant.autor_nome ? <Text style={styles.authorText}>({plant.autor_nome})</Text> : null}
        </Text>

        {/* Chips Coloridos Pastéis */}
        <PlantPastelChips
          plant={plant}
          flowersFruits={flowersFruits}
          cultivation={cultivation}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#e0e0e0',
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  idBadge: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    lineHeight: 20,
  },
  habitBadge: {
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    lineHeight: 20,
    textTransform: 'capitalize',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularName: {
    fontWeight: 'bold',
    flex: 1,
    textTransform: 'capitalize',
    fontSize: 20,
  },
  scientificTitle: {
    fontStyle: 'italic',
    color: '#555',
    fontSize: 14,
    marginTop: 2,
    marginBottom: 6,
  },
  authorText: {
    fontStyle: 'normal',
    color: '#888',
    fontSize: 12,
  },
});
