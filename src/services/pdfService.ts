import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PlantDetailBundle, PlantTheme } from '../types/plant';

function renderPdfRow(label: string, val: string | null | undefined, themeColor: string): string {
  if (!val || !val.trim()) return '';
  return `<tr><td style="padding: 6px 10px; font-weight: bold; width: 35%; color: ${themeColor}; border-bottom: 1px solid #e0e0e0;">${label}</td><td style="padding: 6px 10px; border-bottom: 1px solid #e0e0e0;">${val}</td></tr>`;
}

export async function exportPlantPdf(bundle: PlantDetailBundle, theme: PlantTheme): Promise<void> {
  const { plant, rootsStems, leaves, flowersFruits, cultivation } = bundle;
  const displayName = plant.nomes_populares || plant.nome_cientifico;
  const habitLabel = plant.habito || 'Espécie Botânica';
  const locationLabel = plant.localizacao || plant.colecao_canteiro || 'Campus IFMS';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 25px; color: #333; }
          .header { border-bottom: 3px solid ${theme.primary}; padding-bottom: 15px; margin-bottom: 20px; }
          h1 { color: ${theme.primary}; font-size: 26px; margin: 0 0 4px 0; }
          h2 { font-style: italic; color: #555; font-size: 18px; margin: 0 0 10px 0; }
          .badge { display: inline-block; background-color: ${theme.badgeBg}; color: ${theme.badgeText}; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px; margin-bottom: 8px; }
          .section-title { background-color: ${theme.primary}; color: white; padding: 6px 12px; font-size: 14px; font-weight: bold; border-radius: 4px; margin-top: 18px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px; }
          .footer { text-align: center; margin-top: 35px; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="badge">${plant.id} — ${habitLabel}</span>
          <h1>${displayName}</h1>
          <h2>${plant.nome_cientifico} ${plant.autor_nome ? `<small>(${plant.autor_nome})</small>` : ''}</h2>
          <p style="margin: 0; color: #666; font-size: 13px;">
            <strong>Família:</strong> ${plant.familia || 'Não informada'} | 
            <strong>Hábito:</strong> ${habitLabel} | 
            <strong>Localização:</strong> ${locationLabel}
          </p>
        </div>

        <div class="section-title">1. Informações Gerais e Taxonomia</div>
        <table>
          ${renderPdfRow('Grupo Taxonômico', plant.grupo_taxonomico, theme.primary)}
          ${renderPdfRow('Porte / Altura', plant.porte_altura, theme.primary)}
          ${renderPdfRow('Ciclo de Vida', plant.ciclo_vida, theme.primary)}
          ${renderPdfRow('Origem Biogeográfica', plant.origem_biogeografica, theme.primary)}
          ${renderPdfRow('Status de Ocorrência', plant.status_ocorrencia, theme.primary)}
          ${renderPdfRow('Localização no Campus', locationLabel, theme.primary)}
          ${renderPdfRow('Coordenadas GPS', plant.coordenadas, theme.primary)}
          ${renderPdfRow('Observações', plant.observacoes, theme.primary)}
        </table>

        ${rootsStems ? `
          <div class="section-title">2. Raiz e Caule</div>
          <table>
            ${renderPdfRow('Sistema Radicular', rootsStems.sistema_radicular, theme.primary)}
            ${renderPdfRow('Habitat da Raiz', rootsStems.habitat_raiz, theme.primary)}
            ${renderPdfRow('Raízes Adventícias', rootsStems.raizes_adventicias, theme.primary)}
            ${renderPdfRow('Modificação da Raiz', rootsStems.modificacao_raiz, theme.primary)}
            ${renderPdfRow('Posição do Caule', rootsStems.posicao_caule, theme.primary)}
            ${renderPdfRow('Tipo de Caule', rootsStems.tipo_caule, theme.primary)}
            ${renderPdfRow('Consistência do Caule', rootsStems.consistencia_caule, theme.primary)}
            ${renderPdfRow('Estrutura de Reserva', rootsStems.estrutura_reserva, theme.primary)}
            ${renderPdfRow('Estruturas de Fixação', rootsStems.estruturas_fixacao, theme.primary)}
            ${renderPdfRow('Espinhos / Acúleos', rootsStems.espinhos_aculeos, theme.primary)}
            ${renderPdfRow('Observações', rootsStems.observacoes, theme.primary)}
          </table>
        ` : ''}

        ${leaves ? `
          <div class="section-title">3. Folhas</div>
          <table>
            ${renderPdfRow('Composição', leaves.composicao, theme.primary)}
            ${renderPdfRow('Filotaxia', leaves.filotaxia, theme.primary)}
            ${renderPdfRow('Inserção', leaves.insercao, theme.primary)}
            ${renderPdfRow('Forma do Limbo', leaves.limbo_forma, theme.primary)}
            ${renderPdfRow('Ápice do Limbo', leaves.limbo_apice, theme.primary)}
            ${renderPdfRow('Base do Limbo', leaves.limbo_base, theme.primary)}
            ${renderPdfRow('Margem do Limbo', leaves.limbo_margem, theme.primary)}
            ${renderPdfRow('Nervação', leaves.nervacao, theme.primary)}
            ${renderPdfRow('Indumento', leaves.indumento, theme.primary)}
            ${renderPdfRow('Consistência', leaves.consistencia, theme.primary)}
            ${renderPdfRow('Folha Composta', leaves.folha_composta_tipo, theme.primary)}
            ${renderPdfRow('Nº de Folíolos', leaves.num_foliolos, theme.primary)}
            ${renderPdfRow('Dimensões', leaves.dimensoes, theme.primary)}
            ${renderPdfRow('Observações', leaves.observacoes, theme.primary)}
          </table>
        ` : ''}

        ${flowersFruits ? `
          <div class="section-title">4. Flor e Fruto</div>
          <table>
            ${renderPdfRow('Inflorescência', flowersFruits.inflorescencia, theme.primary)}
            ${renderPdfRow('Sexo da Flor', flowersFruits.flor_sexo, theme.primary)}
            ${renderPdfRow('Simetria Floral', flowersFruits.flor_simetria, theme.primary)}
            ${renderPdfRow('Perianto', flowersFruits.perianto, theme.primary)}
            ${renderPdfRow('Androceu / Estames', flowersFruits.androceu_num_estames, theme.primary)}
            ${renderPdfRow('Ovário', flowersFruits.ovario, theme.primary)}
            ${renderPdfRow('Fruto: Categoria', flowersFruits.fruto_categoria, theme.primary)}
            ${renderPdfRow('Fruto: Tipo', flowersFruits.fruto_tipo, theme.primary)}
            ${renderPdfRow('Consistência', flowersFruits.fruto_consistencia, theme.primary)}
            ${renderPdfRow('Nº de Sementes', flowersFruits.num_sementes, theme.primary)}
            ${renderPdfRow('Dispersão', flowersFruits.dispersao, theme.primary)}
            ${renderPdfRow('Época de Floração', flowersFruits.epoca_floracao, theme.primary)}
            ${renderPdfRow('Época de Frutificação', flowersFruits.epoca_frutificacao, theme.primary)}
            ${renderPdfRow('Observações', flowersFruits.observacoes, theme.primary)}
          </table>
        ` : ''}

        ${cultivation ? `
          <div class="section-title">5. Cultivo e Usos</div>
          <table>
            ${renderPdfRow('Luminosidade', cultivation.luminosidade, theme.primary)}
            ${renderPdfRow('Necessidade Hídrica', cultivation.necessidade_hidrica, theme.primary)}
            ${renderPdfRow('Solo / Substrato', cultivation.tipo_solo_substrato, theme.primary)}
            ${renderPdfRow('pH Ideal', cultivation.ph, theme.primary)}
            ${renderPdfRow('Tolerância ao Frio', cultivation.tolerancia_frio, theme.primary)}
            ${renderPdfRow('Tolerância à Seca', cultivation.tolerancia_seca, theme.primary)}
            ${renderPdfRow('Propagação Principal', cultivation.propagacao_principal, theme.primary)}
            ${renderPdfRow('Uso Principal', cultivation.uso_principal, theme.primary)}
            ${renderPdfRow('Outros Usos', cultivation.outros_usos, theme.primary)}
            ${renderPdfRow('Observações', cultivation.observacoes, theme.primary)}
          </table>
        ` : ''}

        <div class="footer">
          <p>Ficha Botânica gerada pelo aplicativo <strong>BuscaKa'avo</strong></p>
          <p>Instituto Federal de Mato Grosso do Sul — Campus Ponta Porã</p>
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    UTI: '.pdf',
    mimeType: 'application/pdf',
    dialogTitle: 'Compartilhar Ficha da Planta',
  });
}
