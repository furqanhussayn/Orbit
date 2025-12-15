import { supabase } from '@/integrations/supabase/client';

export type ImageKind = 'avatar' | 'post' | 'spaceIcon';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const MAX_MB: Record<ImageKind, number> = {
  avatar: 5,
  post: 12,
  spaceIcon: 5,
};

const BUCKET: Record<ImageKind, string> = {
  avatar: 'avatars',
  post: 'posts',
  spaceIcon: 'space-icon',
};

const FIXED_EXT: Record<ImageKind, string> = {
  avatar: 'png',
  post: 'jpg',
  spaceIcon: 'png',
};

export const validateImage = (file: File, kind: ImageKind): string | null => {
  if (!file) return 'No file selected';
  if (!ALLOWED_TYPES.includes(file.type)) return 'Invalid file type';
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_MB[kind]) return `File too large. Max ${MAX_MB[kind]} MB`;
  return null;
};

const pathFor = (kind: ImageKind, id: string) => {
  const ext = FIXED_EXT[kind];
  return `${id}.${ext}`;
};

export const uploadImage = async (
  kind: ImageKind,
  id: string,
  file: File
): Promise<{ publicUrl?: string; error?: string }> => {
  const bucket = BUCKET[kind];
  const path = pathFor(kind, id);
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) {
    return { error: uploadError.message };
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl };
};
