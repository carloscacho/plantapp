import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import {
  PlantData,
  FlowersFruitsData,
  CultivationData,
} from '../../types/plant';

type PlantPastelChipsProps = {
  plant: PlantData;
  flowersFruits: FlowersFruitsData | null;
  cultivation: CultivationData | null;
};

export function PlantPastelChips({
  plant,
  flowersFruits,
  cultivation,
}: PlantPastelChipsProps) {
  const fruitInfo = flowersFruits?.fruto_tipo || flowersFruits?.fruto_categoria;
  const locationLabel = plant.localizacao || plant.colecao_canteiro;

  return (
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

      {/* 4. Fruto (Pêssego Pastel) */}
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

      {/* 5. Uso Principal / Cultivo (Verde Menta Pastel) */}
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
  );
}

const styles = StyleSheet.create({
  quickTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  pastelChip: {
    borderRadius: 8,
    height: 28,
  },
  /* 1. Família */
  familyChip: { backgroundColor: '#E0F2FE' },
  familyText: { fontSize: 11, color: '#0369A1', fontWeight: '600' },

  /* 2. Localização */
  locationChip: { backgroundColor: '#EDE9FE' },
  locationText: { fontSize: 11, color: '#5B21B6', fontWeight: '600' },

  /* 3. Flor */
  flowerChip: { backgroundColor: '#FCE7F3' },
  flowerText: { fontSize: 11, color: '#9D174D', fontWeight: '600' },

  /* 4. Fruto */
  fruitChip: { backgroundColor: '#FFEDD5' },
  fruitText: { fontSize: 11, color: '#9A3412', fontWeight: '600' },

  /* 5. Cultivo */
  cultivationChip: { backgroundColor: '#DCFCE7' },
  cultivationText: { fontSize: 11, color: '#15803D', fontWeight: '600' },

  /* 6. Sol */
  sunChip: { backgroundColor: '#FEF9C3' },
  sunText: { fontSize: 11, color: '#854D0E', fontWeight: '600' },

  /* 7. Ciclo */
  cycleChip: { backgroundColor: '#F1F5F9' },
  cycleText: { fontSize: 11, color: '#334155', fontWeight: '600' },

  /* 8. Origem */
  originChip: { backgroundColor: '#FEF3C7' },
  originText: { fontSize: 11, color: '#92400E', fontWeight: '600' },
});
