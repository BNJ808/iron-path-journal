import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut, Save, User } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarUploader } from '@/components/AvatarUploader';
import { WeightTracker } from '@/components/profile/WeightTracker';

const profileFormSchema = z.object({
    username: z.string()
        .min(3, { message: "Le nom d'utilisateur doit faire au moins 3 caractères." })
        .max(50, { message: "Le nom d'utilisateur ne doit pas dépasser 50 caractères." })
        .regex(/^[a-zA-Z0-9_]+$/, { message: "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des underscores." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { profile, isLoading: isLoadingProfile, updateProfile, uploadAvatar } = useProfile();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            username: '',
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (profile?.username) {
            form.reset({ username: profile.username });
        }
    }, [profile, form]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Vous avez été déconnecté.');
            navigate('/auth');
        }
    };
    
    const onSubmit = async (values: ProfileFormValues) => {
        if (!user || !profile) return;

        try {
            await updateProfile({ id: user.id, username: values.username });
            toast.success("Profil mis à jour !");
            form.reset({ username: values.username });
        } catch (error: any) {
            if (error.message.includes('profiles_username_key')) {
                 form.setError('username', { type: 'manual', message: "Ce nom d'utilisateur est déjà pris." });
            } else {
                toast.error("Erreur lors de la mise à jour du profil: " + error.message);
            }
        }
    };

    const handleAvatarUpload = async (file: File) => {
        if (!uploadAvatar) return;
        return uploadAvatar(file);
    };

    const isLoading = !user || isLoadingProfile;

    return (
        <div className="p-2 sm:p-4 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <User className="h-6 w-6 text-gray-100" />
                <h1 className="text-2xl font-bold text-gray-100">Profil</h1>
            </div>
            <div className="space-y-6 bg-gray-800/50 p-4 sm:p-6 rounded-lg">
                <div className="flex flex-col items-center space-y-4">
                    <AvatarUploader
                        avatarUrl={profile?.avatar_url}
                        username={profile?.username}
                        onUpload={handleAvatarUpload}
                        isLoading={isLoading}
                    />
                    <div className="text-center">
                        {isLoading ? (
                            <Skeleton className="h-6 w-40" />
                        ) : (
                            <>
                                <p className="text-sm text-gray-400">Email</p>
                                <p className="font-semibold text-lg">{user.email}</p>
                            </>
                        )}
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom d'utilisateur</FormLabel>
                                    <FormControl>
                                        {isLoading ? <Skeleton className="h-10 w-full" /> : <Input placeholder="Votre nom d'utilisateur" {...field} />}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading || form.formState.isSubmitting || !form.formState.isDirty} className="w-full">
                            <Save />
                            Enregistrer
                        </Button>
                    </form>
                </Form>
                
                <div className="border-t border-gray-700"></div>

                <WeightTracker />
                
                <div className="border-t border-gray-700"></div>


                <Button onClick={handleLogout} variant="destructive" className="w-full">
                    <LogOut />
                    Déconnexion
                </Button>
            </div>
        </div>
    );
};

export default ProfilePage;
