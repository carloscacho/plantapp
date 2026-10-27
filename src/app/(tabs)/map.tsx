import { View, StyleSheet, FlatList, ScrollView, Image, TouchableOpacity, Platform, Dimensions, Alert } from 'react-native';
import { Appbar, Text, Card, Chip, IconButton, Badge, SegmentedButtons, Portal, Modal, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { useSync } from '../../database/SyncProvider';
import { useState, useEffect, useMemo, useRef } from 'react';
import * as Location from 'expo-location';

// Importação condicional para evitar erro em plataforma Web
let WebViewComponent: any = null;
if (Platform.OS !== 'web') {
  try {
    WebViewComponent = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('react-native-webview não pôde ser carregado:', e);
  }
}

type CampusArea = {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string | null;
  cor: string | null;
  icone: string | null;
  poligono_coords?: string | null;
  centro_latitude?: number | null;
  centro_longitude?: number | null;
  total_exemplares: number;
};

// Imagem aérea oficial com as demarcações coloridas das áreas do campus em Sanga Puitã
const CAMPUS_AERIAL_IMAGE = require('../../../assets/images/fotoComAreas.jpeg');

// Coordenadas Centrais do IFMS Campus Ponta Porã (Distrito de Sanga Puitã • BR-463 Km 14)
const CAMPUS_CENTER_LAT = -22.62087;
const CAMPUS_CENTER_LNG = -55.60751;

export default function MapScreen() {
  const db = useSQLiteContext();
  const { dataVersion } = useSync();
  const [areas, setAreas] = useState<CampusArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<CampusArea | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<string>('lista');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Estado do GPS do usuário
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; accuracy: number | null } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);

  const webViewRef = useRef<any>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAreas() {
      try {
        const result = await db.getAllAsync<CampusArea>(`
          SELECT a.id, a.nome, a.descricao, a.tipo, a.cor, a.icone,
                 a.poligono_coords, a.centro_latitude, a.centro_longitude,
                 COUNT(pl.id) as total_exemplares
          FROM areas a
          LEFT JOIN plant_locations pl ON pl.area_id = a.id
          GROUP BY a.id
          ORDER BY a.id ASC
        `);
        if (isMounted) {
          setAreas(result);
        }
      } catch (error) {
        console.error('Erro ao carregar áreas do campus:', error);
      }
    }

    fetchAreas();

    return () => {
      isMounted = false;
    };
  }, [db, dataVersion]);

  useEffect(() => {
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  // Função para ativar e rastrear a posição do usuário no mapa via GPS
  const handleStartGps = async () => {
    try {
      setGpsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão de Localização',
          'Para visualizar sua posição no campus, permita o acesso ao GPS do aparelho nas configurações.'
        );
        setGpsLoading(false);
        return;
      }

      // Posição inicial precisa
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, accuracy } = location.coords;
      setUserLocation({ latitude, longitude, accuracy });
      setGpsActive(true);
      setGpsLoading(false);

      // Injeta na WebView para posicionar e voar até o usuário
      sendLocationToMap(latitude, longitude, accuracy || 15, true);

      // Inicia monitoramento contínuo enquanto caminha pelo campus
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }

      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 3, // atualiza a cada 3 metros
          timeInterval: 3000,  // ou a cada 3 segundos
        },
        (loc) => {
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          const acc = loc.coords.accuracy || 10;
          setUserLocation({ latitude: lat, longitude: lng, accuracy: acc });
          sendLocationToMap(lat, lng, acc, false);
        }
      );
    } catch (err) {
      console.warn('Erro ao obter localização GPS:', err);
      Alert.alert('Erro no GPS', 'Não foi possível obter sua posição atual. Verifique se o GPS está ativado.');
      setGpsLoading(false);
    }
  };

  const sendLocationToMap = (lat: number, lng: number, accuracy: number, centerUser: boolean) => {
    const jsCode = `
      if (window.updateUserLocation) {
        window.updateUserLocation(${lat}, ${lng}, ${accuracy}, ${centerUser});
      }
      true;
    `;
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  const handleCenterCampus = () => {
    const jsCode = `
      if (window.centerCampus) {
        window.centerCampus();
      }
      true;
    `;
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  const getIconName = (icone: string | null, tipo: string | null) => {
    if (icone) return icone;
    switch (tipo) {
      case 'pomar': return 'fruit-cherries';
      case 'viveiro': return 'flower';
      case 'horta': return 'carrot';
      case 'patio': return 'domain';
      case 'culturas': return 'barley';
      case 'agrostologia': return 'grass';
      case 'reserva': return 'forest';
      case 'ilp': return 'cow';
      default: return 'tree';
    }
  };

  const handleSelectArea = (area: CampusArea) => {
    setSelectedArea(area);
    setModalVisible(true);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.35, 1.0));
  };

  const handleZoomReset = () => {
    setZoomLevel(1.0);
  };

  // HTML com mapa interativo Leaflet + Satélite Esri (Sanga Puitã • IFMS BR-463)
  const leafletHtml = useMemo(() => {
    const areasJson = JSON.stringify(
      areas.map((a) => {
        let coords: { lat: number; lng: number }[] = [];
        try {
          if (a.poligono_coords) {
            coords = typeof a.poligono_coords === 'string' ? JSON.parse(a.poligono_coords) : a.poligono_coords;
          }
        } catch {
          coords = [];
        }
        return {
          id: a.id,
          nome: a.nome,
          descricao: a.descricao,
          tipo: a.tipo,
          cor: a.cor || '#32A041',
          centro_lat: a.centro_latitude || CAMPUS_CENTER_LAT,
          centro_lng: a.centro_longitude || CAMPUS_CENTER_LNG,
          total_exemplares: a.total_exemplares,
          coords: coords,
        };
      })
    );

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #121212; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .custom-popup .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.35); padding: 4px; }
    .custom-popup .leaflet-popup-content { margin: 10px 12px; line-height: 1.4; }
    .area-badge-label { background: rgba(0,0,0,0.75); color: #fff; border: 1px solid rgba(255,255,255,0.25); font-size: 11px; font-weight: bold; border-radius: 6px; padding: 3px 7px; box-shadow: 0 2px 6px rgba(0,0,0,0.5); }
    
    /* Efeito de pulso moderno do GPS do usuário (estilo Google Maps) */
    .user-gps-pulse {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pulse-dot {
      width: 14px;
      height: 14px;
      background: #1976D2;
      border: 2.5px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(0,0,0,0.45);
      position: absolute;
    }
    .pulse-ring {
      width: 32px;
      height: 32px;
      background: rgba(33, 150, 243, 0.45);
      border-radius: 50%;
      animation: pulse-anim 1.8s infinite ease-out;
      position: absolute;
    }
    @keyframes pulse-anim {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    // Centro Real do IFMS Campus Ponta Porã (Sanga Puitã • Km 14 BR-463)
    const CAMPUS_CENTER = [${CAMPUS_CENTER_LAT}, ${CAMPUS_CENTER_LNG}];
    const map = L.map('map', {
      center: CAMPUS_CENTER,
      zoom: 16,
      minZoom: 13,
      maxZoom: 19
    });

    // 1. Camada Satélite Esri World Imagery (Alta resolução de Sanga Puitã)
    const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: "Esri &copy; BuscaKa'avo",
      maxZoom: 19
    }).addTo(map);

    // 2. Rótulos e rodovias da Esri (BR-463)
    const esriLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(map);

    // 3. OpenStreetMap alternativo
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OSM &copy; Contribuidores',
      maxZoom: 19
    });

    L.control.layers({
      '🛰️ Satélite (Esri)': esriSatellite,
      '🗺️ Mapa de Ruas (OSM)': osm
    }, {
      'Rótulos e Nomes': esriLabels
    }, { position: 'topleft' }).addTo(map);

    function notifyReactNative(areaId) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_AREA', id: areaId }));
      }
    }

    const areas = ${areasJson};
    const polyGroup = L.featureGroup().addTo(map);

    areas.forEach(a => {
      if (a.coords && a.coords.length >= 3) {
        const latLngs = a.coords.map(c => [c.lat, c.lng]);
        const poly = L.polygon(latLngs, {
          color: a.cor,
          fillColor: a.cor,
          fillOpacity: 0.38,
          weight: 3
        }).addTo(polyGroup);

        poly.bindTooltip(a.nome, {
          permanent: true,
          direction: 'center',
          className: 'area-badge-label'
        });

        poly.bindPopup(\`
          <div style="min-width: 170px;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="display:inline-block; width:12px; height:12px; border-radius:6px; background:\${a.cor};"></span>
              <strong style="font-size:14px; color:#111;">\${a.nome}</strong>
            </div>
            <p style="font-size:11px; color:#555; margin:0 0 8px 0;">\${a.descricao || 'Setor do Campus IFMS Sanga Puitã'}</p>
            <div style="font-size:11px; color:#1b5e20; background:#e8f5e9; padding:4px 8px; border-radius:6px; margin-bottom:8px; font-weight:600;">
              🌿 \${a.total_exemplares} exemplar(es)
            </div>
            <button onclick="notifyReactNative('\${a.id}')" style="width:100%; background:\${a.cor}; color:#fff; border:none; padding:7px 10px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">
              Abrir Ficha da Área
            </button>
          </div>
        \`, { className: 'custom-popup' });

        poly.on('click', () => {
          notifyReactNative(a.id);
        });
      }
    });

    // Gerenciamento do GPS do Usuário no Mapa
    let userMarker = null;
    let userCircle = null;

    window.updateUserLocation = function(lat, lng, accuracy, centerNow) {
      if (!userMarker) {
        const pulseIcon = L.divIcon({
          className: 'user-gps-pulse',
          html: '<div class="pulse-ring"></div><div class="pulse-dot"></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        userMarker = L.marker([lat, lng], { icon: pulseIcon, zIndexOffset: 1000 }).addTo(map);
        userMarker.bindPopup('<b>📍 Sua Localização Atual</b><br><small>Precisão: ±' + Math.round(accuracy) + 'm</small>');

        userCircle = L.circle([lat, lng], {
          radius: accuracy || 15,
          color: '#1976D2',
          fillColor: '#2196F3',
          fillOpacity: 0.15,
          weight: 1.5
        }).addTo(map);
      } else {
        userMarker.setLatLng([lat, lng]);
        userCircle.setLatLng([lat, lng]);
        if (accuracy) userCircle.setRadius(accuracy);
      }

      if (centerNow) {
        map.flyTo([lat, lng], 17, { duration: 1.2 });
      }
    };

    window.centerCampus = function() {
      map.flyTo(CAMPUS_CENTER, 16, { duration: 1.0 });
    };
  </script>
</body>
</html>
    `;
  }, [areas]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_AREA') {
        const found = areas.find((a) => a.id === data.id);
        if (found) {
          handleSelectArea(found);
        }
      }
    } catch (e) {
      console.warn('Erro ao processar mensagem do WebView:', e);
    }
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content
          title="BuscaKa'avo — Mapa do Campus"
          subtitle="IFMS Sanga Puitã • BR-463 Km 14"
          titleStyle={styles.appBarTitle}
          subtitleStyle={styles.appBarSubtitle}
        />
      </Appbar.Header>

      {/* Seletor de Modo de Visualização (Setores com Foto vs Satélite GPS) */}
      <View style={styles.segmentedContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            {
              value: 'lista',
              label: `Setores e Foto (${areas.length})`,
              icon: 'format-list-bulleted',
            },
            {
              value: 'satelite',
              label: 'Satélite GPS',
              icon: 'satellite-variant',
            },
          ]}
        />
      </View>

      {/* 1. MODO SETORES E FOTO (Foto Aérea Oficial no topo + Cards de cada setor) */}
      {viewMode === 'lista' && (
        <FlatList
          data={areas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              {/* Foto Aérea Oficial com Zoom e Pan */}
              <View style={styles.imageViewerWrapper}>
                <ScrollView
                  style={styles.imageScrollVertical}
                  contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                  horizontal
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                >
                  <ScrollView
                    contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                    showsVerticalScrollIndicator={false}
                  >
                    <Image
                      source={CAMPUS_AERIAL_IMAGE}
                      style={{
                        width: (screenWidth - 28) * zoomLevel,
                        height: 310 * zoomLevel,
                        borderRadius: 12,
                      }}
                      resizeMode="contain"
                    />
                  </ScrollView>
                </ScrollView>

                {/* Controles Flutuantes de Zoom */}
                <View style={styles.zoomControls}>
                  <IconButton
                    icon="plus"
                    size={18}
                    mode="contained"
                    containerColor="#ffffff"
                    iconColor="#1b5e20"
                    onPress={handleZoomIn}
                    style={styles.zoomBtn}
                  />
                  <IconButton
                    icon="minus"
                    size={18}
                    mode="contained"
                    containerColor="#ffffff"
                    iconColor="#1b5e20"
                    onPress={handleZoomOut}
                    style={styles.zoomBtn}
                  />
                  <IconButton
                    icon="restore"
                    size={18}
                    mode="contained"
                    containerColor="#ffffff"
                    iconColor="#1b5e20"
                    onPress={handleZoomReset}
                    style={styles.zoomBtn}
                  />
                  <View style={styles.zoomTag}>
                    <Text style={styles.zoomTagText}>{Math.round(zoomLevel * 100)}%</Text>
                  </View>
                </View>

                {/* Legenda Informativa */}
                <View style={styles.legendOverlay}>
                  <Text style={styles.legendText}>
                    💡 Foto oficial do campus com as 8 grandes áreas demarcadas
                  </Text>
                </View>
              </View>

              {/* Banner Explicativo */}
              <View style={styles.headerBox}>
                <View style={styles.infoBanner}>
                  <IconButton icon="information-outline" iconColor="#155724" size={24} style={{ margin: 0 }} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text variant="titleSmall" style={{ color: '#155724', fontWeight: 'bold' }}>
                      Setores do Campus IFMS Sanga Puitã
                    </Text>
                    <Text variant="bodySmall" style={{ color: '#1b5e20', marginTop: 2, lineHeight: 18 }}>
                      O campus do IFMS em Sanga Puitã é dividido em setores para orientar as práticas botânicas e agrícolas. Toque em qualquer setor para ver os detalhes.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const areaColor = item.cor || '#32A041';
            return (
              <Card style={styles.card} mode="elevated" onPress={() => handleSelectArea(item)}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: areaColor + '20', borderColor: areaColor, borderWidth: 1.5 }]}>
                      <IconButton
                        icon={getIconName(item.icone, item.tipo)}
                        iconColor={areaColor}
                        size={24}
                        style={{ margin: 0 }}
                      />
                    </View>
                    <View style={styles.headerText}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text variant="titleMedium" style={styles.areaTitle}>{item.nome}</Text>
                        <Badge style={[styles.codeBadge, { backgroundColor: areaColor + '20', color: areaColor, borderColor: areaColor, borderWidth: 1 }]}>
                          {item.id}
                        </Badge>
                      </View>
                      <Text variant="bodySmall" style={styles.areaType}>
                        Tipo: <Text style={{ fontWeight: 'bold', color: areaColor }}>{item.tipo || 'Setor'}</Text>
                      </Text>
                    </View>
                  </View>

                  {item.descricao && (
                    <Text variant="bodyMedium" style={styles.areaDesc}>
                      {item.descricao}
                    </Text>
                  )}

                  <View style={styles.footerRow}>
                    <Chip icon="map-marker-radius" style={styles.tagChip} compact textStyle={{ fontSize: 12 }}>
                      {item.total_exemplares} {item.total_exemplares === 1 ? 'exemplar catalogado' : 'exemplares catalogados'}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            );
          }}
        />
      )}

      {/* 2. MODO SATÉLITE GPS (Leaflet + Esri World Imagery em Sanga Puitã + Posição do Usuário) */}
      {viewMode === 'satelite' && (
        <View style={styles.satelliteContainer}>
          {Platform.OS === 'web' ? (
            <iframe
              srcDoc={leafletHtml}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Mapa Satélite IFMS Sanga Puitã"
            />
          ) : WebViewComponent ? (
            <WebViewComponent
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: leafletHtml }}
              style={styles.webview}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scalesPageToFit={true}
            />
          ) : (
            <View style={styles.fallbackBox}>
              <Text variant="titleMedium" style={{ color: '#666', textAlign: 'center' }}>
                O visualizador WebView não está disponível nesta plataforma. Utilize a aba "Setores e Foto" ou acesse via Web/Mobile.
              </Text>
            </View>
          )}

          {/* Barra Flutuante de Controles do GPS e Centralização */}
          <View style={styles.mapFloatingActions}>
            <Button
              mode="contained"
              icon={gpsLoading ? () => <ActivityIndicator size={16} color="#ffffff" /> : 'crosshairs-gps'}
              buttonColor={gpsActive ? '#1976D2' : '#2E7D32'}
              textColor="#ffffff"
              onPress={handleStartGps}
              style={styles.floatingBtn}
              labelStyle={{ fontSize: 12 }}
            >
              {gpsActive ? 'GPS Ativo' : 'Meu GPS'}
            </Button>

            <Button
              mode="contained"
              icon="school"
              buttonColor="#37474F"
              textColor="#ffffff"
              onPress={handleCenterCampus}
              style={styles.floatingBtn}
              labelStyle={{ fontSize: 12 }}
            >
              Campus IFMS
            </Button>
          </View>

          {/* Indicador de Precisão do GPS */}
          {userLocation && (
            <View style={styles.gpsStatusBadge}>
              <Text style={styles.gpsStatusText}>
                📍 Precisão GPS: ±{Math.round(userLocation.accuracy || 0)}m ({userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)})
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Modal com Ficha Detalhada do Setor */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedArea && (
            <View>
              <View style={styles.modalHeader}>
                <View style={[styles.modalDot, { backgroundColor: selectedArea.cor || '#32A041' }]} />
                <View style={{ flex: 1 }}>
                  <Text variant="titleLarge" style={styles.modalTitle}>
                    {selectedArea.nome}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#666', textTransform: 'capitalize' }}>
                    Setor {selectedArea.id} • {selectedArea.tipo || 'Área de Campo'}
                  </Text>
                </View>
                <IconButton icon="close" size={22} onPress={() => setModalVisible(false)} />
              </View>

              <Divider style={{ marginVertical: 12 }} />

              <Text variant="bodyMedium" style={styles.modalDesc}>
                {selectedArea.descricao || 'Área demarcada no campus do IFMS em Sanga Puitã.'}
              </Text>

              <View style={styles.modalMetaRow}>
                <View style={styles.modalMetaItem}>
                  <Text style={styles.metaLabel}>Exemplares Georreferenciados</Text>
                  <Text style={[styles.metaVal, { color: selectedArea.cor || '#32A041' }]}>
                    {selectedArea.total_exemplares}
                  </Text>
                </View>
                {selectedArea.centro_latitude && (
                  <View style={styles.modalMetaItem}>
                    <Text style={styles.metaLabel}>Coordenadas Centrais (Sanga Puitã)</Text>
                    <Text style={styles.metaValSmall}>
                      {selectedArea.centro_latitude.toFixed(4)}, {selectedArea.centro_longitude?.toFixed(4)}
                    </Text>
                  </View>
                )}
              </View>

              <Button
                mode="contained"
                buttonColor={selectedArea.cor || '#32A041'}
                textColor="#ffffff"
                style={{ marginTop: 16, borderRadius: 8 }}
                onPress={() => setModalVisible(false)}
              >
                Entendido
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  appBar: { backgroundColor: '#1B5E20' },
  appBarTitle: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  appBarSubtitle: { color: '#E8F5E9', fontSize: 12 },
  segmentedContainer: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#ffffff' },
  headerWrapper: { marginBottom: 10 },
  imageViewerWrapper: {
    height: 310,
    marginVertical: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageScrollVertical: { flex: 1 },
  zoomControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  zoomBtn: {
    margin: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  zoomTag: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  zoomTagText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  legendOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  legendText: { color: '#ffffff', fontSize: 11, textAlign: 'center' },
  satelliteContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: '#1a1a1a' },
  fallbackBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  mapFloatingActions: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  floatingBtn: {
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  gpsStatusBadge: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    zIndex: 100,
  },
  gpsStatusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  listContainer: { padding: 14, paddingBottom: 36 },
  headerBox: { marginTop: 4, marginBottom: 8 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d4edda',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  card: { marginBottom: 12, backgroundColor: '#ffffff', borderRadius: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1, marginLeft: 12 },
  areaTitle: { fontWeight: 'bold', color: '#222' },
  codeBadge: { fontWeight: 'bold', fontSize: 11 },
  areaType: { color: '#666', marginTop: 2 },
  areaDesc: { color: '#444', marginTop: 8, lineHeight: 20 },
  footerRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  tagChip: { backgroundColor: '#f1f8e9' },
  modalContent: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalDot: { width: 16, height: 16, borderRadius: 8 },
  modalTitle: { fontWeight: 'bold', color: '#111' },
  modalDesc: { color: '#444', lineHeight: 22, fontSize: 14 },
  modalMetaRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  modalMetaItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  metaLabel: { fontSize: 11, color: '#777', marginBottom: 4 },
  metaVal: { fontSize: 18, fontWeight: 'bold' },
  metaValSmall: { fontSize: 12, color: '#333', fontWeight: '500' },
});
