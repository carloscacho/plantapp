import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

type FieldRowProps = {
  label: string;
  value: string | null | undefined;
};

export function FieldRow({ label, value }: FieldRowProps) {
  if (!value || value.trim() === '') return null;

  return (
    <View style={styles.fieldRow}>
      <Text variant="labelMedium" style={styles.fieldLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={styles.fieldValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldRow: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
  },
  fieldLabel: {
    color: '#777',
    fontWeight: '600',
    marginBottom: 2,
  },
  fieldValue: {
    color: '#222',
    fontSize: 14,
    lineHeight: 20,
  },
});
