import { View, Text, StyleSheet } from 'react-native';

export default function AdminScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel Administrativo</Text>
      <Text>Ações: Importar Planilha, Gerar QR Codes.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#d32f2f' },
});
