import { useState, useEffect } from 'react';
import { CosmicButton } from '@/components/CosmicButton';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateImage, uploadImage } from '@/lib/imageUpload';

interface SpaceIconUploadProps {
  spaceId: string;
  initialUrl?: string | null;
  onUploaded?: (url: string) => void;
}

export const SpaceIconUpload = ({ spaceId, initialUrl, onUploaded }: SpaceIconUploadProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
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
    const err = validateImage(file, 'spaceIcon');
    if (err) {
      toast.error(err);
      return;
    }
    setUploading(true);
    const { publicUrl, error } = await uploadImage('spaceIcon', spaceId, file);
    if (error || !publicUrl) {
      toast.error(error || 'Upload failed');
      setUploading(false);
      return;
    }
    const { error: dbErr } = await supabase
      .from('spaces')
      .update({ icon_url: publicUrl })
      .eq('id', spaceId);
    if (dbErr) {
      toast.error('Failed to save space icon');
    } else {
      toast.success('Space icon updated');
      onUploaded?.(publicUrl);
    }
    setUploading(false);
  };

  return (
    <GlassCard className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        {preview && (
          <img src={preview} alt="Space icon preview" className="w-16 h-16 rounded-xl border border-border object-cover" />
        )}
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={onSelect}
          disabled={uploading}
        />
      </div>
      <CosmicButton onClick={onUpload} disabled={uploading} className="min-w-28">
        {uploading ? 'Uploading…' : 'Upload Space Icon'}
      </CosmicButton>
    </GlassCard>
  );
};

