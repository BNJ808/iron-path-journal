import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

export const useProfile = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error && error.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows"
                throw new Error(error.message);
            }
            return data;
        },
        enabled: !!userId,
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
            queryClient.setQueryData(['profile', userId], data);
        },
    });

    const uploadAvatar = async (file: File) => {
        if (!user) throw new Error("User not authenticated.");

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
        
        return updateProfileMutation.mutateAsync({ id: user.id, avatar_url: publicUrl });
    };

    return {
        profile,
        isLoading,
        updateProfile: updateProfileMutation.mutateAsync,
        uploadAvatar,
    };
};
