
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const weightFormSchema = z.object({
    weight: z.coerce.number().positive({ message: "Le poids doit être un nombre positif." }),
    date: z.string().min(1, { message: "La date est requise." }),
});

type WeightFormValues = z.infer<typeof weightFormSchema>;

export const WeightTracker = () => {
    const { measurements, isLoading, addMeasurement, deleteMeasurement } = useBodyMeasurements();

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

    const handleDelete = async (measurementId: string) => {
        try {
            await deleteMeasurement(measurementId);
            toast.success("Poids supprimé !");
        } catch (error: any) {
            toast.error("Erreur lors de la suppression: " + error.message);
        }
    };

    return (
        <Card className="app-card">
            <CardHeader>
                <CardTitle className="text-foreground">Suivi du poids</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                             <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
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
                                    <FormItem className="flex-1">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "justify-start text-left font-normal w-full",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? (
                                                            format(new Date(field.value + 'T00:00:00'), "d MMMM yyyy", { locale: fr })
                                                        ) : (
                                                            <span>Choisissez une date</span>
                                                        )}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                                                    }}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                    className="pointer-events-auto"
                                                />
                                            </PopoverContent>
                                        </Popover>
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
                    <h3 className="font-semibold text-foreground">Historique</h3>
                    {isLoading ? (
                        <div className="space-y-2">
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                        </div>
                    ) : measurements && measurements.length > 0 ? (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {measurements.map((m) => (
                                 <li key={m.id} className="flex justify-between items-center p-2 bg-secondary/50 rounded-xl">
                                     <div>
                                         <span className="text-sm text-muted-foreground">{format(new Date(m.date + 'T00:00:00'), "d MMMM yyyy", { locale: fr })}</span>
                                         <span className="font-bold text-foreground ml-4">{m.weight} kg</span>
                                     </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="h-8 w-8 hover:bg-destructive/20">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucune mesure de poids enregistrée.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
