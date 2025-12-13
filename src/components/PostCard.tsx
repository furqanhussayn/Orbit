import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Hash, Flag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import { CosmicButton } from './CosmicButton';
import { CommentsSection } from './CommentsSection';
import { cn } from '@/lib/utils';
import { useReports } from '@/hooks/useReports';

interface PostCardProps {
  id: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
    id?: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
  spaceName?: string;
  onClick?: () => void;
  onLike?: () => void;
  onSave?: () => void;
}

export const PostCard = ({
  id,
  author,
  content,
  image,
  likes,
  comments,
  isLiked = false,
  isBookmarked = false,
  createdAt,
  spaceName,
  onClick,
  onLike,
  onSave
}: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const { reportContent } = useReports();

  return (
    <GlassCard 
      className="cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Author header */}
      <div className="flex items-center gap-3 mb-4">
        <Link 
          to={author.id ? `/profile/${author.id}` : '#'}
          onClick={(e) => e.stopPropagation()}
          className="relative"
        >
          <img 
            src={author.avatar} 
            alt={author.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
          />
          <div className="absolute inset-0 rounded-full border-2 border-transparent hover:border-primary/50 transition-colors" />
        </Link>
        <div className="flex-1">
          <Link 
            to={author.id ? `/profile/${author.id}` : '#'}
            onClick={(e) => e.stopPropagation()}
            className="block"
          >
            <h4 className="font-semibold text-foreground hover:text-primary transition-colors">
              {author.name}
            </h4>
          </Link>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">@{author.handle} · {createdAt}</p>
            {spaceName && (
              <span className="flex items-center gap-1 text-xs text-primary">
                <Hash className="w-3 h-3" />
                {spaceName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-foreground/90 mb-4 leading-relaxed">{content}</p>

      {/* Image */}
      {image && (
        <div className="relative mb-4 rounded-xl overflow-hidden">
          <img 
            src={image} 
            alt="Post content"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <button 
          onClick={(e) => { e.stopPropagation(); onLike?.(); }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
            isLiked ? "text-secondary" : "text-muted-foreground hover:text-secondary"
          )}
        >
          <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          <span className="text-sm">{likes}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(true);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{comments}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowReportModal(true);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
        >
          <Flag className="w-5 h-5" />
          <span className="text-sm">Report</span>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); onSave?.(); }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
            isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
        </button>
      </div>

      {showComments && (
        <CommentsSection
          postId={id}
          onClose={() => setShowComments(false)}
        />
      )}

      <AnimatePresence>
        {showReportModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GlassCard
                className="relative w-full max-w-md p-6"
                initial={{ scale: 0.95, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 12 }}
                transition={{ type: 'spring', duration: 0.4 }}
                hover={false}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Report Post</h2>
                  <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-muted rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <textarea
                  placeholder="Why are you reporting this post?"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-32 mb-4"
                />
                <CosmicButton
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!reportReason.trim()) return;
                    const ok = await reportContent('post', id, reportReason);
                    if (ok) {
                      setShowReportModal(false);
                      setReportReason('');
                    }
                  }}
                  className="w-full"
                >
                  Submit Report
                </CosmicButton>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export default PostCard;
