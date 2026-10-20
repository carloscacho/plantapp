import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  PlantData,
  RootsStemsData,
  LeavesData,
  FlowersFruitsData,
  CultivationData,
  PlantDetailBundle,
} from '../types/plant';
import { getThemeForHabit } from '../constants/plantTheme';

export function usePlantDetail(id: string | string[] | undefined) {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [plant, setPlant] = useState<PlantData | null>(null);
  const [rootsStems, setRootsStems] = useState<RootsStemsData | null>(null);
  const [leaves, setLeaves] = useState<LeavesData | null>(null);
  const [flowersFruits, setFlowersFruits] = useState<FlowersFruitsData | null>(null);
  const [cultivation, setCultivation] = useState<CultivationData | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAllData() {
      if (!id) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        let cleanId = String(Array.isArray(id) ? id[0] : id).trim();
        if (/^\d+$/.test(cleanId)) {
          cleanId = `P${cleanId.padStart(3, '0')}`;
        }

        const plantRes = await db.getFirstAsync<PlantData>(
          'SELECT * FROM plants WHERE id = ?',
          cleanId
        );

        if (!isMounted) return;
        setPlant(plantRes);

        if (plantRes) {
          const [rsRes, lfRes, ffRes, cultRes] = await Promise.all([
            db.getFirstAsync<RootsStemsData>(
              'SELECT * FROM plant_roots_stems WHERE plant_id = ?',
              cleanId
            ),
            db.getFirstAsync<LeavesData>(
              'SELECT * FROM plant_leaves WHERE plant_id = ?',
              cleanId
            ),
            db.getFirstAsync<FlowersFruitsData>(
              'SELECT * FROM plant_flowers_fruits WHERE plant_id = ?',
              cleanId
            ),
            db.getFirstAsync<CultivationData>(
              'SELECT * FROM plant_cultivation WHERE plant_id = ?',
              cleanId
            ),
          ]);

          if (isMounted) {
            setRootsStems(rsRes);
            setLeaves(lfRes);
            setFlowersFruits(ffRes);
            setCultivation(cultRes);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes da planta:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAllData();

    return () => {
      isMounted = false;
    };
  }, [id, db]);

  const theme = getThemeForHabit(plant?.habito);

  const bundle: PlantDetailBundle | null = plant
    ? {
        plant,
        rootsStems,
        leaves,
        flowersFruits,
        cultivation,
      }
    : null;

  return {
    plant,
    rootsStems,
    leaves,
    flowersFruits,
    cultivation,
    bundle,
    theme,
    loading,
  };
}
