import { useState, useEffect } from 'react';
import { CosmicButton } from '@/components/CosmicButton';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateImage, uploadImage } from '@/lib/imageUpload';

interface AvatarUploadProps {
  onUploaded?: (url: string) => void;
}

export const AvatarUpload = ({ onUploaded }: AvatarUploadProps) => {
  const { user, profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onUpload = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }
    if (!file) {
      toast.error('Select an image first');
      return;
    }
    const err = validateImage(file, 'avatar');
    if (err) {
      toast.error(err);
      return;
    }
    setUploading(true);
    const { publicUrl, error } = await uploadImage('avatar', user.id, file);
    if (error || !publicUrl) {
      toast.error(error || 'Upload failed');
      setUploading(false);
      return;
    }
    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);
    if (dbErr) {
      toast.error('Failed to save avatar');
    } else {
      toast.success('Avatar updated');
      onUploaded?.(publicUrl);
    }
    setUploading(false);
  };

  const current = preview || profile?.avatar_url || '/avatar.png';

  return (
    <GlassCard className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <img src={current} alt="Avatar preview" className="w-16 h-16 rounded-full border border-border object-cover" />
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={onSelect}
          disabled={uploading}
        />
      </div>
      <CosmicButton onClick={onUpload} disabled={uploading} className="min-w-28">
        {uploading ? 'Uploading…' : 'Upload Avatar'}
      </CosmicButton>
    </GlassCard>
  );
};

