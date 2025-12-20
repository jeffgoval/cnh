'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2 } from 'lucide-react'
import { uploadDocument } from '@/lib/actions/upload'
import { toast } from 'sonner'

interface ProfileAvatarProps {
    url?: string
    name?: string
    onUploadSuccess: (url: string) => void
}

export function ProfileAvatar({ url, name, onUploadSuccess }: ProfileAvatarProps) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'avatar')

        try {
            const result = await uploadDocument(formData)
            if (result.error) throw new Error(result.error)
            if (result.url) {
                onUploadSuccess(result.url)
                toast.success('Foto atualizada!')
            }
        } catch (err: any) {
            toast.error(err.message || 'Erro no upload')
        } finally {
            setUploading(false)
        }
    }

    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U'

    return (
        <div className="relative group">
            <Avatar className="h-40 w-40 border-4 border-muted transition-all group-hover:border-primary/50">
                <AvatarImage src={url} className="object-cover" />
                <AvatarFallback className="text-5xl bg-primary/10 text-primary font-medium">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <label
                htmlFor="avatar-upload-shared"
                className="absolute bottom-2 right-2 p-3 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95"
            >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </label>
            <input
                id="avatar-upload-shared"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
            />
        </div>
    )
}
