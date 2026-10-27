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
          <Appbar.Content title="BuscaKa'avo - Leitor QR" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
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
    
    // Suporta códigos diretos como "P001", "P025", números "1" -> "P001" ou URLs como "https://.../P001"
    let plantId = data.trim();
    const urlMatch = plantId.match(/(?:plant\/|qr\/)?(P\d+|\d+)\/?$/i);
    if (urlMatch) {
      const code = urlMatch[1].toUpperCase();
      plantId = code.startsWith('P') ? code : `P${code.padStart(3, '0')}`;
    } else if (/^\d+$/.test(plantId)) {
      plantId = `P${plantId.padStart(3, '0')}`;
    }

    router.push(`/plant/${plantId}`);
    
    // Libera o leitor para novos scans após um atraso (útil se o usuário voltar para essa tela)
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#32A041' }}>
        <Appbar.Content title="BuscaKa'avo - Leitor QR" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
      </Appbar.Header>
      
      {isScanning ? (
        <View style={styles.cameraContainer}>
          <CameraView 
            style={StyleSheet.absoluteFill} 
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
    ...StyleSheet.absoluteFill,
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
