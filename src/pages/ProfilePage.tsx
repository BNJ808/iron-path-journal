
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings } from 'lucide-react';
import { AvatarUploader } from '@/components/AvatarUploader';
import { useProfile } from '@/hooks/useProfile';
import { ThemeSwitcher } from '@/components/profile/ThemeSwitcher';
import { ColorSoftnessSlider } from '@/components/profile/ColorSoftnessSlider';
import { WeightTracker } from '@/components/profile/WeightTracker';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user || !profile || !updateProfile) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (data.publicUrl) {
      await updateProfile({ ...profile, avatar_url: data.publicUrl });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement du profil...</p>
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

        {/* Profile Info Card */}
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
              />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {profile?.username || 'Nom d\'utilisateur non défini'}
                </h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings Card */}
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

        {/* Weight Tracker Card */}
        <Card className="app-card mb-6">
          <CardContent className="p-6">
            <WeightTracker />
          </CardContent>
        </Card>

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
