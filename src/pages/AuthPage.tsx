
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Connexion réussie !');
            navigate('/');
        }
        setLoading(false);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const passwordSchema = z.string()
            .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
            .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une lettre minuscule."})
            .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une lettre majuscule."})
            .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre."});

        const result = passwordSchema.safeParse(password);
        if (!result.success) {
            result.error.errors.forEach(error => toast.error(error.message));
            return;
        }
        
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });
        if (error) {
            toast.error(error.message);
        } else {
            toast.info('Veuillez vérifier votre email pour confirmer votre inscription.');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
            <Seo
                title="Carnet Muscu — application de suivi de musculation"
                description="Suivez vos séances de musculation : exercices, séries, charges, records personnels, statistiques de progression et calendrier d'entraînement."
                path="/auth"
            />
            <header className="max-w-md text-center space-y-3">
                <h1 className="text-3xl font-bold">Bienvenue sur Carnet Muscu</h1>
                <p className="text-muted-foreground">
                    Votre carnet d'entraînement de musculation : enregistrez vos séances
                    (exercices, séries, charges et répétitions), suivez vos records
                    personnels, visualisez votre progression avec des statistiques
                    détaillées et planifiez vos séances dans le calendrier.
                </p>
            </header>
            <Tabs defaultValue="signin" className="w-full max-w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Se connecter</TabsTrigger>
                    <TabsTrigger value="signup">S'inscrire</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">

                    <Card>
                        <CardHeader>
                            <CardTitle>Connexion</CardTitle>
                            <CardDescription>Accédez à votre compte pour retrouver vos séances.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-signin">Email</Label>
                                    <Input id="email-signin" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-signin">Mot de passe</Label>
                                    <Input id="password-signin" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Chargement...' : 'Se connecter'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="signup">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inscription</CardTitle>
                            <CardDescription>Créez un compte pour sauvegarder votre progression.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-signup">Email</Label>
                                    <Input id="email-signup" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-signup">Mot de passe</Label>
                                    <Input id="password-signup" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Chargement...' : 'S\'inscrire'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AuthPage;
