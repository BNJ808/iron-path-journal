
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Vous avez été déconnecté.');
            navigate('/auth');
        }
    };

    if (!user) {
        return <div className="p-4 text-center">Chargement...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-100 mb-6">Profil</h1>
            <div className="space-y-6 bg-gray-800/50 p-4 rounded-lg">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-400">Email</span>
                    <span className="font-semibold text-lg">{user.email}</span>
                </div>
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                </Button>
            </div>
        </div>
    );
};

export default ProfilePage;
