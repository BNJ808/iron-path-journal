
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Pencil, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface AvatarUploaderProps {
    avatarUrl: string | null | undefined;
    username: string | null | undefined;
    onUpload: (file: File) => Promise<any>;
    isLoading?: boolean;
}

export const AvatarUploader = ({ avatarUrl, username, onUpload, isLoading }: AvatarUploaderProps) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        if (uploading || isLoading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await onUpload(file);
            toast.success('Avatar mis à jour !');
        } catch (error: any) {
            toast.error("Échec du téléversement de l'avatar: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const getInitials = (name: string | null | undefined) => {
        return name ? name.substring(0, 2).toUpperCase() : '..';
    }

    if (isLoading) {
        return <Skeleton className="h-32 w-32 rounded-full" />
    }

    return (
        <div className="relative group w-32 h-32 mx-auto cursor-pointer" onClick={handleAvatarClick}>
            <Avatar className="w-32 h-32 text-4xl">
                <AvatarImage src={avatarUrl ?? undefined} alt={username ?? 'Avatar'} />
                <AvatarFallback className="bg-gray-700 text-gray-300">
                    {uploading ? <Loader2 className="animate-spin" /> : getInitials(username)}
                </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                    <Loader2 className="animate-spin text-white" />
                ) : (
                    <Pencil className="text-white" />
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
                disabled={uploading}
            />
        </div>
    );
};
