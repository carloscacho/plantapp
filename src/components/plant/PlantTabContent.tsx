import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import {
  BotanicalTabId,
  PlantData,
  RootsStemsData,
  LeavesData,
  FlowersFruitsData,
  CultivationData,
  PlantTheme,
} from '../../types/plant';
import { FieldRow } from './FieldRow';

type PlantTabContentProps = {
  selectedTab: BotanicalTabId;
  plant: PlantData;
  rootsStems: RootsStemsData | null;
  leaves: LeavesData | null;
  flowersFruits: FlowersFruitsData | null;
  cultivation: CultivationData | null;
  theme: PlantTheme;
};

export function PlantTabContent({
  selectedTab,
  plant,
  rootsStems,
  leaves,
  flowersFruits,
  cultivation,
  theme,
}: PlantTabContentProps) {
  const locationLabel = plant.localizacao || plant.colecao_canteiro;

  return (
    <Card style={styles.detailsCard} mode="outlined">
      <Card.Content>
        {selectedTab === 'geral' && (
          <View>
            <Text
              variant="titleMedium"
              style={[styles.sectionHeader, { color: theme.primary }]}
            >
              Classificação e Ocorrência
            </Text>
            <FieldRow label="Gênero" value={plant.genero} />
            <FieldRow label="Família" value={plant.familia} />
            <FieldRow label="Grupo Taxonômico" value={plant.grupo_taxonomico} />
            <FieldRow label="Hábito" value={plant.habito} />
            <FieldRow label="Porte / Altura" value={plant.porte_altura} />
            <FieldRow label="Ciclo de Vida" value={plant.ciclo_vida} />
            <FieldRow label="Origem Biogeográfica" value={plant.origem_biogeografica} />
            <FieldRow label="Status de Ocorrência" value={plant.status_ocorrencia} />
            <FieldRow label="Localização no Campus" value={locationLabel} />
            <FieldRow label="Coleção / Canteiro" value={plant.colecao_canteiro} />
            <FieldRow label="Coordenadas GPS" value={plant.coordenadas} />
            <FieldRow label="Observações" value={plant.observacoes} />
          </View>
        )}

        {selectedTab === 'raiz_caule' && (
          <View>
            <Text
              variant="titleMedium"
              style={[styles.sectionHeader, { color: theme.primary }]}
            >
              Morfologia de Raiz e Caule
            </Text>
            {rootsStems ? (
              <>
                <FieldRow label="Sistema Radicular" value={rootsStems.sistema_radicular} />
                <FieldRow label="Habitat da Raiz" value={rootsStems.habitat_raiz} />
                <FieldRow label="Raiz Primária" value={rootsStems.raiz_primaria} />
                <FieldRow label="Raízes Adventícias" value={rootsStems.raizes_adventicias} />
                <FieldRow label="Modificação da Raiz" value={rootsStems.modificacao_raiz} />
                <FieldRow label="Gravitropismo" value={rootsStems.gravitropismo_raiz} />
                <FieldRow label="Posição do Caule" value={rootsStems.posicao_caule} />
                <FieldRow label="Tipo de Caule" value={rootsStems.tipo_caule} />
                <FieldRow label="Consistência do Caule" value={rootsStems.consistencia_caule} />
                <FieldRow label="Ramificação" value={rootsStems.ramificacao} />
                <FieldRow label="Gema Apical" value={rootsStems.gema_apical} />
                <FieldRow label="Gemas Axilares" value={rootsStems.gemas_axilares} />
                <FieldRow label="Estrutura de Reserva" value={rootsStems.estrutura_reserva} />
                <FieldRow label="Estruturas de Fixação" value={rootsStems.estruturas_fixacao} />
                <FieldRow label="Espinhos / Acúleos" value={rootsStems.espinhos_aculeos} />
                <FieldRow label="Lenticelas" value={rootsStems.lenticelas} />
                <FieldRow label="Observações" value={rootsStems.observacoes} />
              </>
            ) : (
              <Text style={styles.emptyField}>Sem registros cadastrados para raiz e caule.</Text>
            )}
          </View>
        )}

        {selectedTab === 'folhas' && (
          <View>
            <Text
              variant="titleMedium"
              style={[styles.sectionHeader, { color: theme.primary }]}
            >
              Morfologia Foliar
            </Text>
            {leaves ? (
              <>
                <FieldRow label="Persistência" value={leaves.persistencia} />
                <FieldRow label="Composição" value={leaves.composicao} />
                <FieldRow label="Filotaxia" value={leaves.filotaxia} />
                <FieldRow label="Inserção" value={leaves.insercao} />
                <FieldRow label="Pecíolo" value={leaves.peciolo} />
                <FieldRow label="Bainha" value={leaves.bainha} />
                <FieldRow label="Lígula" value={leaves.ligula} />
                <FieldRow label="Estípula" value={leaves.estipula} />
                <FieldRow label="Forma do Limbo" value={leaves.limbo_forma} />
                <FieldRow label="Ápice do Limbo" value={leaves.limbo_apice} />
                <FieldRow label="Base do Limbo" value={leaves.limbo_base} />
                <FieldRow label="Margem do Limbo" value={leaves.limbo_margem} />
                <FieldRow label="Nervação" value={leaves.nervacao} />
                <FieldRow label="Textura Superficial" value={leaves.textura_superficial} />
                <FieldRow label="Indumento" value={leaves.indumento} />
                <FieldRow label="Consistência" value={leaves.consistencia} />
                <FieldRow label="Cor / Variegação" value={leaves.cor_variegacao} />
                <FieldRow label="Dimensões" value={leaves.dimensoes} />
                <FieldRow label="Tipo de Folha Composta" value={leaves.folha_composta_tipo} />
                <FieldRow label="Nº de Folíolos" value={leaves.num_foliolos} />
                <FieldRow label="Forma dos Folíolos" value={leaves.forma_foliolos} />
                <FieldRow label="Metamorfose Foliar" value={leaves.metamorfose_foliar} />
                <FieldRow label="Gavinhas" value={leaves.gavinhas} />
                <FieldRow label="Espinhos Foliares" value={leaves.espinhos_foliares} />
                <FieldRow label="Brácteas" value={leaves.bracteas} />
                <FieldRow label="Observações" value={leaves.observacoes} />
              </>
            ) : (
              <Text style={styles.emptyField}>Sem registros cadastrados para folhas.</Text>
            )}
          </View>
        )}

        {selectedTab === 'flor_fruto' && (
          <View>
            <Text
              variant="titleMedium"
              style={[styles.sectionHeader, { color: theme.primary }]}
            >
              Estruturas Reprodutivas
            </Text>
            {flowersFruits ? (
              <>
                <FieldRow label="Sexualidade da Planta" value={flowersFruits.sexualidade_planta} />
                <FieldRow label="Inflorescência" value={flowersFruits.inflorescencia} />
                <FieldRow label="Posição da Inflorescência" value={flowersFruits.posicao_inflorescencia} />
                <FieldRow label="Sexo da Flor" value={flowersFruits.flor_sexo} />
                <FieldRow label="Simetria Floral" value={flowersFruits.flor_simetria} />
                <FieldRow label="Perianto" value={flowersFruits.perianto} />
                <FieldRow label="Cálice" value={flowersFruits.calice} />
                <FieldRow label="Corola" value={flowersFruits.corola} />
                <FieldRow label="Androceu / Estames" value={flowersFruits.androceu_num_estames} />
                <FieldRow label="Ovário" value={flowersFruits.ovario} />
                <FieldRow label="Placentação" value={flowersFruits.placentacao} />
                <FieldRow label="Época de Floração" value={flowersFruits.epoca_floracao} />
                <FieldRow label="Polinizadores" value={flowersFruits.polinizadores} />
                <FieldRow label="Fruto: Categoria" value={flowersFruits.fruto_categoria} />
                <FieldRow label="Fruto: Consistência" value={flowersFruits.fruto_consistencia} />
                <FieldRow label="Fruto: Deiscência" value={flowersFruits.fruto_deiscencia} />
                <FieldRow label="Fruto: Tipo" value={flowersFruits.fruto_tipo} />
                <FieldRow label="Nº de Sementes" value={flowersFruits.num_sementes} />
                <FieldRow label="Dispersão" value={flowersFruits.dispersao} />
                <FieldRow label="Pseudofruto" value={flowersFruits.pseudofruto} />
                <FieldRow label="Época de Frutificação" value={flowersFruits.epoca_frutificacao} />
                <FieldRow label="Observações" value={flowersFruits.observacoes} />
              </>
            ) : (
              <Text style={styles.emptyField}>Sem registros cadastrados para flor e fruto.</Text>
            )}
          </View>
        )}

        {selectedTab === 'cultivo' && (
          <View>
            <Text
              variant="titleMedium"
              style={[styles.sectionHeader, { color: theme.primary }]}
            >
              Requisitos de Cultivo e Usos
            </Text>
            {cultivation ? (
              <>
                <FieldRow label="Clima" value={cultivation.clima} />
                <FieldRow label="Faixa de Temperatura" value={cultivation.faixa_temperatura} />
                <FieldRow label="Luminosidade" value={cultivation.luminosidade} />
                <FieldRow label="Necessidade Hídrica" value={cultivation.necessidade_hidrica} />
                <FieldRow label="Umidade do Ar" value={cultivation.umidade_ar} />
                <FieldRow label="Tipo de Solo / Substrato" value={cultivation.tipo_solo_substrato} />
                <FieldRow label="Drenagem" value={cultivation.drenagem} />
                <FieldRow label="pH Ideal" value={cultivation.ph} />
                <FieldRow label="Fertilidade" value={cultivation.fertilidade} />
                <FieldRow label="Tolerância ao Frio" value={cultivation.tolerancia_frio} />
                <FieldRow label="Tolerância à Seca" value={cultivation.tolerancia_seca} />
                <FieldRow label="Tolerância a Encharcamento" value={cultivation.tolerancia_encharcamento} />
                <FieldRow label="Propagação Principal" value={cultivation.propagacao_principal} />
                <FieldRow label="Outras Formas de Propagação" value={cultivation.outras_propagacoes} />
                <FieldRow label="Poda / Manutenção" value={cultivation.poda_manutencao} />
                <FieldRow label="Pragas Observadas" value={cultivation.pragas_observadas} />
                <FieldRow label="Doenças Observadas" value={cultivation.doencas_observadas} />
                <FieldRow label="Toxicidade" value={cultivation.toxicidade} />
                <FieldRow label="Uso Principal" value={cultivation.uso_principal} />
                <FieldRow label="Outros Usos" value={cultivation.outros_usos} />
                <FieldRow label="Exigências Edafoclimáticas" value={cultivation.exigencias_edafoclimaticas} />
                <FieldRow label="Adaptação Regional" value={cultivation.adaptacao_regional} />
                <FieldRow label="Observações" value={cultivation.observacoes} />
              </>
            ) : (
              <Text style={styles.emptyField}>Sem registros cadastrados para cultivo.</Text>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#e0e0e0',
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 6,
  },
  emptyField: {
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 10,
  },
});
