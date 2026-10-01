import { View, StyleSheet } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#32A041' }}>
        <Appbar.Content title="Ka'avoHeka - Mapa" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Mapa do Campus</Text>
        <Text variant="bodyLarge">Aqui exibiremos as Grandes Áreas (Campo Externo, Pomar, etc).</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontWeight: 'bold', marginBottom: 10, color: '#32A041' },
});
