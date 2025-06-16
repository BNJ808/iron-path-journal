
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtenir la session initiale
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Écouter les changements d'état d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
                
                // Rediriger vers la page d'authentification si déconnecté
                if (event === 'SIGNED_OUT') {
                    // Utiliser setTimeout pour éviter les problèmes de navigation
                    setTimeout(() => {
                        window.location.href = '/auth';
                    }, 100);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Rediriger vers /auth si pas d'utilisateur connecté (sauf si déjà sur /auth)
    useEffect(() => {
        if (!loading && !user && !window.location.pathname.includes('/auth')) {
            window.location.href = '/auth';
        }
    }, [user, loading]);

    const value = {
        user,
        session,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
