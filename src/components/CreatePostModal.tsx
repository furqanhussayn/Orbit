import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CosmicButton } from './CosmicButton';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useSpaces } from '@/hooks/useSpaces';
import { toast } from 'sonner';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  defaultSpaceId?: string;
  hideSpaceSelector?: boolean;
}

export const CreatePostModal = ({ isOpen, onClose, onSubmit, defaultSpaceId, hideSpaceSelector }: CreatePostModalProps) => {
  const [content, setContent] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('');
  const { profile, user } = useAuth();
  const { spaces, loading: spacesLoading } = useSpaces();
  const { createPost } = usePosts();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setSelectedSpace('');
    }
    if (isOpen && defaultSpaceId) {
      setSelectedSpace(defaultSpaceId);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    if (!selectedSpace) {
      toast.error('Please select a space');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a post');
      return;
    }

    const result = await createPost({
      space_id: selectedSpace,
      title: content.substring(0, 100),
      body: content,
    });

    if (result) {
      toast.success('Post created!');
      setContent('');
      setSelectedSpace('');
      onSubmit?.();
      onClose();
    }
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
              className="w-full max-w-lg"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              hover={false}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold gradient-cosmic-text">Create Post</h2>
                <motion.button
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={profile?.avatar_url || "/avatar.png"}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full border-2 border-primary/30 object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{profile?.username || 'User'}</p>
                  <p className="text-sm text-muted-foreground">@{profile?.username || 'user'}</p>
                </div>
              </div>

              {/* Space selector */}
              {!hideSpaceSelector && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-foreground">Select Space</label>
                  <select
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={spacesLoading}
                  >
                    <option value="">Select a space (required)</option>
                    {spaces.map((space) => (
                      <option key={space.id} value={space.id}>
                        {space.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Content input */}
              <textarea
                className="w-full h-40 bg-muted/50 border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="What's happening in your orbit?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <motion.button
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Image className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{content.length}/280</span>
                  <CosmicButton
                    onClick={handleSubmit}
                    disabled={!content.trim() || !selectedSpace || spacesLoading}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post
                  </CosmicButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
