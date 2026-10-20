import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { BotanicalTabId, PlantTheme } from '../../types/plant';

type PlantTabsNavProps = {
  selectedTab: BotanicalTabId;
  onSelectTab: (tab: BotanicalTabId) => void;
  theme: PlantTheme;
};

const TABS: { id: BotanicalTabId; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'raiz_caule', label: 'Raiz & Caule' },
  { id: 'folhas', label: 'Folhas' },
  { id: 'flor_fruto', label: 'Flor & Fruto' },
  { id: 'cultivo', label: 'Cultivo & Usos' },
];

export function PlantTabsNav({
  selectedTab,
  onSelectTab,
  theme,
}: PlantTabsNavProps) {
  return (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <Chip
              key={tab.id}
              selected={isActive}
              onPress={() => onSelectTab(tab.id)}
              style={[
                styles.sectionTab,
                isActive && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              textStyle={
                isActive ? styles.sectionTabTextActive : styles.sectionTabText
              }
              showSelectedOverlay
            >
              {tab.label}
            </Chip>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    marginBottom: 12,
  },
  tabsScroll: {
    gap: 8,
  },
  sectionTab: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  sectionTabText: {
    color: '#555',
    fontSize: 13,
  },
  sectionTabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
