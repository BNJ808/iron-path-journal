
import { toast } from 'sonner';

export const handleSupabaseError = (error: any, context: string = '') => {
  console.error(`Supabase error in ${context}:`, error);
  
  // Gestion spécifique des erreurs RLS
  if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
    toast.error("Accès non autorisé. Veuillez vous reconnecter.");
    return;
  }
  
  // Gestion des erreurs d'authentification
  if (error.code === 'PGRST302' || error.message?.includes('JWT')) {
    toast.error("Session expirée. Veuillez vous reconnecter.");
    return;
  }
  
  // Gestion des erreurs de contraintes
  if (error.code === '23505') {
    toast.error("Cette donnée existe déjà.");
    return;
  }
  
  if (error.code === '23503') {
    toast.error("Référence invalide. Veuillez vérifier vos données.");
    return;
  }
  
  // Erreur générale avec contexte
  const message = error.message || 'Une erreur inattendue est survenue';
  toast.error(`Erreur ${context ? `(${context})` : ''}: ${message}`);
};

export const isAuthError = (error: any): boolean => {
  return error.code === 'PGRST301' || 
         error.code === 'PGRST302' || 
         error.message?.includes('JWT') ||
         error.message?.includes('row-level security');
};
