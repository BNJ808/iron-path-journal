
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
        <div className="flex items-center justify-center min-h-screen p-4">
            <Tabs defaultValue="signin" className="w-[400px]">
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
