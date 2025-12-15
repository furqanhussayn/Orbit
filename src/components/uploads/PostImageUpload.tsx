import { useState, useEffect } from 'react';
import { CosmicButton } from '@/components/CosmicButton';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateImage, uploadImage } from '@/lib/imageUpload';

interface PostImageUploadProps {
  postId: string;
  initialUrl?: string | null;
  onUploaded?: (url: string) => void;
}

export const PostImageUpload = ({ postId, initialUrl, onUploaded }: PostImageUploadProps) => {
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
    const err = validateImage(file, 'post');
    if (err) {
      toast.error(err);
      return;
    }
    setUploading(true);
    const { publicUrl, error } = await uploadImage('post', postId, file);
    if (error || !publicUrl) {
      toast.error(error || 'Upload failed');
      setUploading(false);
      return;
    }
    const { error: dbErr } = await supabase
      .from('posts')
      .update({ media_url: publicUrl })
      .eq('id', postId);
    if (dbErr) {
      toast.error('Failed to save post image');
    } else {
      toast.success('Post image updated');
      onUploaded?.(publicUrl);
    }
    setUploading(false);
  };

  return (
    <GlassCard className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        {preview && (
          <img src={preview} alt="Post preview" className="w-24 h-24 rounded-xl border border-border object-cover" />
        )}
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={onSelect}
          disabled={uploading}
        />
      </div>
      <CosmicButton onClick={onUpload} disabled={uploading} className="min-w-28">
        {uploading ? 'Uploading…' : 'Upload Post Image'}
      </CosmicButton>
    </GlassCard>
  );
};

