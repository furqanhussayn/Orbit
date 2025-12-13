import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CosmicButton } from './CosmicButton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const { profile, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile && isOpen) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      toast.error('Username must be less than 20 characters');
      return;
    }

    setLoading(true);
    
    const { error } = await updateProfile({
      username: username.trim(),
      bio: bio.trim() || null,
      avatar_url: avatarUrl.trim() || '/avatar.png',
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
      return;
    }

    toast.success('Profile updated successfully!');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
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
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-cosmic-text">Edit Profile</h2>
                <motion.button
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar URL */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="/avatar.png"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  {avatarUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                        onError={(e) => {
                          e.currentTarget.src = '/avatar.png';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Username <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    minLength={3}
                    maxLength={20}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {username.length}/20 characters
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={160}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {bio.length}/160 characters
                  </p>
                </div>

                {/* Actions */}
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
                    disabled={loading || !username.trim()}
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

export default EditProfileModal;

