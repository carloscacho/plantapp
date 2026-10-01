import { View, StyleSheet } from 'react-native';
import { Appbar, Text, Button } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: '#32A041' }}>
          <Appbar.Content title="Ka'avoHeka - Leitor QR" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
        </Appbar.Header>
        <View style={styles.content}>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>Precisamos da permissão da câmera para escanear a etiqueta da planta.</Text>
          <Button mode="contained" onPress={requestPermission} buttonColor="#32A041">Conceder Permissão</Button>
        </View>
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setIsScanning(false);
    
    // O mockData possui qrCodeUrl no formato: "https://exemplo.com/qr/1"
    // Extraimos os dígitos no final da URL
    const match = data.match(/\/(\d+)$/);
    const plantId = match ? match[1] : data;

    router.push(`/plant/${plantId}`);
    
    // Libera o leitor para novos scans após um atraso (útil se o usuário voltar para essa tela)
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#32A041' }}>
        <Appbar.Content title="Ka'avoHeka - Leitor QR" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
      </Appbar.Header>
      
      {isScanning ? (
        <View style={styles.cameraContainer}>
          <CameraView 
            style={StyleSheet.absoluteFillObject} 
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>Alinhe o QR Code no quadrado</Text>
            <Button mode="contained" onPress={() => setIsScanning(false)} style={styles.cancelBtn} buttonColor="#d32f2f">
              Cancelar Leitura
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>Leitor de QR Code</Text>
          <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 30, color: '#555' }}>
            Aponte a câmera para a etiqueta da planta para abrir a ficha técnica instantaneamente.
          </Text>
          <Button mode="contained" icon="qrcode-scan" onPress={() => setIsScanning(true)} buttonColor="#32A041" contentStyle={{ height: 50 }} labelStyle={{ fontSize: 16 }}>
            Escanear Etiqueta
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontWeight: 'bold', marginBottom: 10, color: '#32A041' },
  cameraContainer: { flex: 1, position: 'relative' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#32A041',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  scanText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold'
  },
  cancelBtn: { position: 'absolute', bottom: 50 }
});
