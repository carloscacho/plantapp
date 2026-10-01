import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { Appbar, Text, Card, ActivityIndicator, Button, Divider } from 'react-native-paper';
import { Image } from 'expo-image';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type PlantDetail = {
  id: string;
  nomePopular: string;
  nomeCientifico: string;
  familia: string;
  area: string;
  tipoReproducao: string;
  porte: string;
  clima: string;
  descricao: string;
  imageUrl: string;
};

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const db = useSQLiteContext();
  const [plant, setPlant] = useState<PlantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlant() {
      try {
        const result = await db.getFirstAsync<PlantDetail>('SELECT * FROM plants WHERE id = ?', id as string);
        setPlant(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadPlant();
  }, [id]);

  const exportPDF = async () => {
    if (!plant) return;
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica'; padding: 30px; color: #333; }
              h1 { color: #32A041; font-size: 36px; margin-bottom: 5px; }
              h2 { font-style: italic; color: #666; font-size: 20px; margin-top: 0; }
              .section { margin-top: 30px; padding: 20px; background-color: #f1f8e9; border-radius: 8px; }
              p { line-height: 1.6; font-size: 16px; }
              strong { color: #2e7d32; }
              .footer { text-align: center; margin-top: 50px; font-size: 14px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
            </style>
          </head>
          <body>
            <h1>${plant.nomePopular}</h1>
            <h2>${plant.nomeCientifico}</h2>
            
            <div class="section">
              <p><strong>Família Botânica:</strong> ${plant.familia}</p>
              <p><strong>Setor no Campus:</strong> ${plant.area}</p>
              <p><strong>Tipo de Reprodução:</strong> ${plant.tipoReproducao}</p>
              <p><strong>Porte da Planta:</strong> ${plant.porte}</p>
              <p><strong>Clima Ideal:</strong> ${plant.clima}</p>
            </div>
            
            <div class="section" style="background-color: #fff; border: 1px solid #e0e0e0;">
              <h3 style="color: #32A041; margin-top: 0;">Descrição Botânica e Educacional</h3>
              <p>${plant.descricao}</p>
            </div>
            
            <div class="footer">
              <p>Ficha Técnica gerada pelo aplicativo <strong>Ka'avoHeka</strong></p>
              <p>Instituto Federal - Projeto de Catalogação de Plantas</p>
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
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#32A041" />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: '#32A041' }}>
          <Appbar.BackAction onPress={() => router.back()} color="#fff" />
          <Appbar.Content title="Planta não encontrada" titleStyle={{ color: '#fff' }} />
        </Appbar.Header>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#32A041' }}>
        <Appbar.BackAction onPress={() => router.back()} color="#fff" />
        <Appbar.Content title="Ficha Técnica" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>
        <Card style={styles.card} mode="elevated">
          <Image
            source={{ uri: plant.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={500}
          />
          <Card.Content style={{ paddingTop: 20 }}>
            <Text variant="headlineMedium" style={{ color: '#32A041', fontWeight: 'bold' }}>{plant.nomePopular}</Text>
            <Text variant="titleMedium" style={{ fontStyle: 'italic', color: '#666', marginBottom: 20 }}>{plant.nomeCientifico}</Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyLarge" style={styles.label}>Família:</Text>
              <Text variant="bodyLarge">{plant.familia}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyLarge" style={styles.label}>Setor:</Text>
              <Text variant="bodyLarge">{plant.area}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyLarge" style={styles.label}>Porte:</Text>
              <Text variant="bodyLarge">{plant.porte}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyLarge" style={styles.label}>Clima:</Text>
              <Text variant="bodyLarge">{plant.clima}</Text>
            </View>

            <Divider style={{ marginVertical: 20 }} />

            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 10, color: '#333' }}>Sobre a Espécie</Text>
            <Text variant="bodyLarge" style={{ lineHeight: 24, color: '#555' }}>{plant.descricao}</Text>

          </Card.Content>
        </Card>

        <Button 
          mode="contained" 
          icon="file-pdf-box" 
          onPress={exportPDF} 
          style={{ marginTop: 25 }}
          contentStyle={{ height: 50 }}
          buttonColor="#1976D2"
          labelStyle={{ fontSize: 16 }}
        >
          Exportar Ficha em PDF
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', overflow: 'hidden' },
  image: { width: '100%', height: 280, backgroundColor: '#e0e0e0' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontWeight: 'bold', color: '#444' }
});
