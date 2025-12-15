import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CosmicButton } from './CosmicButton';
import { toast } from 'sonner';
import { validateImage, uploadImage } from '@/lib/imageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SpaceData {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  creator_id: string | null;
}

interface EditSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: SpaceData;
  onUpdated?: () => void;
}

export const EditSpaceModal = ({ isOpen, onClose, space, onUpdated }: EditSpaceModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    if (space && isOpen) {
      setName(space.name || '');
      setDescription(space.description || '');
      setIconUrl(space.icon_url || '');
    }
  }, [space, isOpen]);

  const handleIconSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImage(file, 'spaceIcon');
    if (err) {
      toast.error(err);
      setFileInputKey(k => k + 1);
      return;
    }
    if (!user || user.id !== space.creator_id) {
      toast.error('Only the space author can change the icon');
      return;
    }
    setUploading(true);
    const { publicUrl, error } = await uploadImage('spaceIcon', space.id, file);
    if (error || !publicUrl) {
      toast.error(error || 'Upload failed');
      setUploading(false);
      setFileInputKey(k => k + 1);
      return;
    }
    const { error: updateErr } = await supabase
      .from('spaces')
      .update({ icon_url: publicUrl })
      .eq('id', space.id);
    if (updateErr) {
      toast.error('Failed to save space icon');
    } else {
      setIconUrl(publicUrl);
      toast.success('Space icon updated');
      onUpdated?.();
    }
    setUploading(false);
    setFileInputKey(k => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Space name is required');
      return;
    }

    if (!user || user.id !== space.creator_id) {
      toast.error('Only the space author can edit this space');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('spaces')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        icon_url: iconUrl.trim() || null,
      })
      .eq('id', space.id);

    setLoading(false);

    if (error) {
      toast.error('Failed to update space: ' + (error.message || 'Unknown error'));
      return;
    }

    toast.success('Space updated successfully!');
    onUpdated?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              hover={false}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-cosmic-text">Edit Space</h2>
                <motion.button
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/30">
                    <img
                      src={iconUrl || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200'}
                      alt="Space icon"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200'; }}
                    />
                    <button
                      type="button"
                      className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => document.getElementById('space-icon-file-input')?.click()}
                      disabled={uploading}
                    >
                      <Edit2 className="w-6 h-6" />
                    </button>
                  </div>
                  <input
                    id="space-icon-file-input"
                    key={fileInputKey}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleIconSelect}
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Space Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter space name"
                    required
                    minLength={3}
                    maxLength={60}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {name.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this space..."
                    rows={4}
                    maxLength={300}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {description.length}/300 characters
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                  <CosmicButton
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </CosmicButton>
                  <CosmicButton
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </CosmicButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditSpaceModal;
