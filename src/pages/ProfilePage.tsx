import { AnimatedCard } from '@/components/AnimatedCard';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings } from 'lucide-react';
import { AvatarUploader } from '@/components/AvatarUploader';
import { useProfile } from '@/hooks/useProfile';
import { ThemeSwitcher } from '@/components/profile/ThemeSwitcher';
import { ColorSoftnessSlider } from '@/components/profile/ColorSoftnessSlider';
import { SyncStatus } from '@/components/profile/SyncStatus';
import { DataExport } from '@/components/profile/DataExport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, isLoading, error, uploadAvatar } = useProfile();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Erreur lors de la déconnexion: ' + error.message);
      } else {
        toast.success('Déconnexion réussie');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la déconnexion: ' + error.message);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatar(file);
    } catch (error: any) {
      console.error("Error uploading avatar:", error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erreur lors du chargement du profil</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et préférences</p>
        </div>

        <AnimatedCard index={0}>
          <Card className="app-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <AvatarUploader
                  avatarUrl={profile?.avatar_url}
                  username={profile?.username}
                  onUpload={handleAvatarUpload}
                  isLoading={isLoading}
                />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    {profile?.username || user?.email?.split('@')[0] || 'Utilisateur'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <Card className="app-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Paramètres d'apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ThemeSwitcher />
              <ColorSoftnessSlider />
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard index={2}>
          <div className="mb-6">
            <DataExport />
          </div>
        </AnimatedCard>

        <AnimatedCard index={3}>
          <div className="mb-6">
            <SyncStatus />
          </div>
        </AnimatedCard>

        {/* Sign Out Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSignOut}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
