import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart, Trash } from 'lucide-react';
import { CosmicButton } from './CosmicButton';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface CommentsSectionProps {
  postId: string;
  onClose: () => void;
}

export const CommentsSection = ({ postId, onClose }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [mounted, setMounted] = useState(false);
  const { comments, loading, createComment, likeComment, deleteComment } = useComments(postId);
  const { profile } = useAuth();

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const result = await createComment(newComment.trim());
    if (result) {
      setNewComment('');
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleClose = () => {
    document.body.style.overflow = 'unset';
    onClose();
  };

  if (!postId) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        key="comments-modal"
        className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="w-full max-w-2xl max-h-[80vh] bg-card border-t border-border rounded-t-2xl overflow-hidden flex flex-col shadow-2xl"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <h3 className="text-lg font-bold">Comments</h3>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  {/* Main Comment */}
                  <div className="flex gap-3">
                    <img
                      src={comment.author?.avatar_url || '/avatar.png'}
                      alt={comment.author?.username || 'User'}
                      className="w-10 h-10 rounded-full border-2 border-border/50 object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">
                          {comment.author?.username || 'Unknown'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-foreground/90 mb-2">{comment.body}</p>
                      <button
                        onClick={() => likeComment(comment.id)}
                        className={cn(
                          'flex items-center gap-1 text-sm transition-colors',
                          comment.is_liked
                            ? 'text-secondary'
                            : 'text-muted-foreground hover:text-secondary'
                        )}
                      >
                        <Heart
                          className={cn('w-4 h-4', comment.is_liked && 'fill-current')}
                        />
                        {comment.likes_count || 0}
                      </button>
                      {comment.author_id === profile?.id && (
                        <button
                          onClick={() => {
                            const ok = confirm('Delete this comment? This cannot be undone.');
                            if (!ok) return;
                            deleteComment(comment.id);
                          }}
                          className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-12 space-y-2 border-l-2 border-border/50 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <img
                            src={reply.author?.avatar_url || '/avatar.png'}
                            alt={reply.author?.username || 'User'}
                            className="w-8 h-8 rounded-full border-2 border-border/50 object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-foreground">
                                {reply.author?.username || 'Unknown'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(reply.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/90 mb-1">{reply.body}</p>
                            <button
                              onClick={() => likeComment(reply.id)}
                              className={cn(
                                'flex items-center gap-1 text-xs transition-colors',
                                reply.is_liked
                                  ? 'text-secondary'
                                  : 'text-muted-foreground hover:text-secondary'
                              )}
                            >
                              <Heart
                                className={cn('w-3 h-3', reply.is_liked && 'fill-current')}
                              />
                              {reply.likes_count || 0}
                            </button>
                            {reply.author_id === profile?.id && (
                              <button
                                onClick={() => {
                                  const ok = confirm('Delete this reply? This cannot be undone.');
                                  if (!ok) return;
                                  deleteComment(reply.id);
                                }}
                                className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-3">
              <img
                src={profile?.avatar_url || '/avatar.png'}
                alt="Your avatar"
                className="w-8 h-8 rounded-full border-2 border-primary/30 object-cover flex-shrink-0"
              />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <CosmicButton
                type="submit"
                size="sm"
                disabled={!newComment.trim()}
                className="disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </CosmicButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
};

export default CommentsSection;
