
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const weightFormSchema = z.object({
    weight: z.coerce.number().positive({ message: "Le poids doit être un nombre positif." }),
    date: z.string().min(1, { message: "La date est requise." }),
});

type WeightFormValues = z.infer<typeof weightFormSchema>;

export const WeightTracker = () => {
    const { measurements, isLoading, addMeasurement } = useBodyMeasurements();

    const form = useForm<WeightFormValues>({
        resolver: zodResolver(weightFormSchema),
        defaultValues: {
            weight: undefined,
            date: new Date().toISOString().split('T')[0],
        },
    });

    const onSubmit = async (values: WeightFormValues) => {
        try {
            await addMeasurement({ weight: values.weight, date: values.date });
            toast.success("Poids enregistré !");
            form.reset({
                weight: undefined,
                date: new Date().toISOString().split('T')[0],
            });
        } catch (error: any) {
             toast.error("Erreur lors de l'enregistrement: " + error.message);
        }
    };

    return (
        <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
                <CardTitle className="text-gray-100">Suivi du poids</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex gap-4 items-end">
                             <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormLabel>Poids (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" placeholder="70.5" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                            Enregistrer le poids
                        </Button>
                    </form>
                </Form>
                
                <div className="space-y-2 pt-4">
                    <h3 className="font-semibold text-gray-200">Historique</h3>
                    {isLoading ? (
                        <div className="space-y-2">
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                        </div>
                    ) : measurements && measurements.length > 0 ? (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {measurements.map((m) => (
                                <li key={m.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-md">
                                    <span className="text-sm text-gray-300">{format(new Date(m.date + 'T00:00:00'), "d MMMM yyyy", { locale: fr })}</span>
                                    <span className="font-bold text-gray-100">{m.weight} kg</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-4">Aucune mesure de poids enregistrée.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
