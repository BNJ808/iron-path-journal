
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

export interface UserSettings {
  // Paramètres d'apparence
  theme?: string;
  colorSoftness?: number;
  
  // Préférences des statistiques
  statsCardOrder?: string[];
  statsDateRange?: DateRange;
  hiddenStatsModules?: string[];
  
  // Autres préférences
  timerSettings?: {
    defaultRestTime: number;
    autoStart: boolean;
    soundEnabled: boolean;
  };
  
  // Préférences d'entraînement
  workoutPreferences?: {
    showLastPerformance: boolean;
    autoCompleteRest: boolean;
    defaultWeightUnit: 'kg' | 'lbs';
  };
}

// Fonction pour convertir UserSettings en format compatible avec Supabase Json
const serializeSettings = (settings: Partial<UserSettings>) => {
  const serialized: any = { ...settings };
  
  if (settings.statsDateRange) {
    serialized.statsDateRange = {
      from: settings.statsDateRange.from?.toISOString() || null,
      to: settings.statsDateRange.to?.toISOString() || null,
    };
  }
  
  return serialized;
};

// Fonction pour convertir les données de Supabase en UserSettings
const deserializeSettings = (serialized: any): UserSettings => {
  if (!serialized) return {};
  
  const settings: UserSettings = { ...serialized };
  
  if (serialized.statsDateRange) {
    settings.statsDateRange = {
      from: serialized.statsDateRange.from ? new Date(serialized.statsDateRange.from) : undefined,
      to: serialized.statsDateRange.to ? new Date(serialized.statsDateRange.to) : undefined,
    };
  }
  
  return settings;
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data: settings, isLoading } = useQuery({
    queryKey: ['userSettings', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        return {};
      }
      
      // Si pas de données ou settings est null, retourner un objet vide
      if (!data || !data.settings) {
        return {};
      }
      
      // Désérialiser les paramètres (convertir les strings de dates en objets Date)
      return deserializeSettings(data.settings);
    },
    enabled: !!userId,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      if (!userId) throw new Error('User not authenticated');
      
      const currentSettings = settings || {};
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      // Sérialiser les paramètres (convertir les objets Date en strings)
      const serializedSettings = serializeSettings(updatedSettings);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId, 
          settings: serializedSettings,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      return updatedSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userSettings', userId], data);
      
      // Synchroniser avec localStorage pour la compatibilité
      try {
        if (data.statsCardOrder) {
          localStorage.setItem('statsCardOrder', JSON.stringify(data.statsCardOrder));
        }
        if (data.statsDateRange) {
          localStorage.setItem('statsDateRange', JSON.stringify(data.statsDateRange));
        }
        if (data.theme) {
          localStorage.setItem('theme', data.theme);
        }
      } catch (error) {
        console.error('Error syncing with localStorage:', error);
      }
    },
  });

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      await updateSettingsMutation.mutateAsync(newSettings);
    } catch (error: any) {
      toast.error('Erreur lors de la synchronisation des paramètres: ' + error.message);
      throw error;
    }
  };

  // Synchroniser depuis localStorage vers la base de données au démarrage
  const syncFromLocalStorage = async () => {
    if (!userId || !settings) return;
    
    try {
      let needsSync = false;
      const localUpdates: Partial<UserSettings> = {};
      
      // Vérifier l'ordre des cartes de stats
      const localStatsOrder = localStorage.getItem('statsCardOrder');
      if (localStatsOrder && localStatsOrder !== JSON.stringify(settings.statsCardOrder)) {
        localUpdates.statsCardOrder = JSON.parse(localStatsOrder);
        needsSync = true;
      }
      
      // Vérifier la plage de dates des stats
      const localDateRange = localStorage.getItem('statsDateRange');
      if (localDateRange && localDateRange !== JSON.stringify(settings.statsDateRange)) {
        const parsed = JSON.parse(localDateRange);
        if (parsed.from) parsed.from = new Date(parsed.from);
        if (parsed.to) parsed.to = new Date(parsed.to);
        localUpdates.statsDateRange = parsed;
        needsSync = true;
      }
      
      // Vérifier le thème
      const localTheme = localStorage.getItem('theme');
      if (localTheme && localTheme !== settings.theme) {
        localUpdates.theme = localTheme;
        needsSync = true;
      }
      
      if (needsSync) {
        await updateSettings(localUpdates);
      }
    } catch (error) {
      console.error('Error syncing from localStorage:', error);
    }
  };

  return {
    settings: settings || {},
    isLoading,
    updateSettings,
    syncFromLocalStorage,
  };
};
