
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Type pour le profil incluant la colonne settings
export interface Profile {
  id: string;
  username?: string;  
  avatar_url?: string;
  updated_at?: string;
  settings?: any; // JSONB column
}

export const useProfile = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) return null;
            
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
                throw new Error(error.message);
            }
            
            // Si pas de profil, créer un profil par défaut
            if (!data) {
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({ 
                        id: userId,
                        username: user?.email?.split('@')[0] || 'Utilisateur',
                        settings: {},
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();
                
                if (insertError) {
                    console.error('Error creating profile:', insertError);
                    throw new Error(insertError.message);
                }
                
                return newProfile;
            }
            
            return data;
        },
        enabled: !!userId,
        retry: 1,
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (updatedProfile: Partial<Profile> & { id: string }) => {
            const { error, data } = await supabase
                .from('profiles')
                .upsert({ ...updatedProfile, updated_at: new Date().toISOString() })
                .select()
                .single();

            if (error) {
                throw error;
            }
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['profile', userId] });
            queryClient.invalidateQueries({ queryKey: ['userSettings', userId] });
            queryClient.setQueryData(['profile', userId], data);
        },
    });

    const uploadAvatar = async (file: File) => {
        if (!user) {
            const message = "Utilisateur non authentifié.";
            toast.error(message);
            throw new Error(message);
        }

        // File type validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            const message = "Type de fichier non valide. Veuillez sélectionner une image (JPEG, PNG, GIF, WEBP).";
            toast.error(message);
            throw new Error(message);
        }

        // File size validation (2MB limit)
        const maxSizeInBytes = 2 * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            const message = `Le fichier est trop volumineux. La taille maximale est de ${maxSizeInBytes / 1024 / 1024}MB.`;
            toast.error(message);
            throw new Error(message);
        }

        try {
            if (profile?.avatar_url) {
                const pathSegments = profile.avatar_url.split('/avatars/');
                if (pathSegments.length > 1) {
                    const oldAvatarPath = pathSegments[1];
                    await supabase.storage.from('avatars').remove([oldAvatarPath]);
                }
            }
        
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);
        
            if (uploadError) {
                throw uploadError;
            }
        
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
        
            if (!publicUrl) {
                throw new Error("Could not get public URL for avatar.");
            }
            
            toast.success("Avatar mis à jour !");
            return updateProfileMutation.mutateAsync({ id: user.id, avatar_url: publicUrl });
        } catch (error: any) {
            toast.error(`Erreur lors de l'envoi de l'avatar: ${error.message}`);
            throw error;
        }
    };

    return {
        profile,
        isLoading,
        error,
        updateProfile: updateProfileMutation.mutateAsync,
        uploadAvatar,
    };
};
