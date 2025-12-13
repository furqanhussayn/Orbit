import { motion } from 'framer-motion';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  author: {
    name: string;
    avatar: string;
    handle: string;
  };
  content: string;
  likes: number;
  replies?: number;
  isLiked?: boolean;
  createdAt: string;
  isNested?: boolean;
}

export const CommentItem = ({
  author,
  content,
  likes,
  replies = 0,
  isLiked = false,
  createdAt,
  isNested = false
}: CommentItemProps) => {
  return (
    <motion.div
      className={cn(
        'flex gap-3 py-4',
        isNested && 'ml-12 border-l-2 border-border/50 pl-4'
      )}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src={author.avatar}
        alt={author.name}
        className="w-10 h-10 rounded-full border-2 border-border/50 flex-shrink-0"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-foreground">{author.name}</span>
          <span className="text-sm text-muted-foreground">@{author.handle}</span>
          <span className="text-sm text-muted-foreground">· {createdAt}</span>
        </div>
        <p className="text-foreground/90 mb-3">{content}</p>
        <div className="flex items-center gap-4">
          <motion.button
            className={cn(
              'flex items-center gap-1 text-sm transition-colors',
              isLiked ? 'text-secondary' : 'text-muted-foreground hover:text-secondary'
            )}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
            {likes}
          </motion.button>
          <motion.button
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <MessageCircle className="w-4 h-4" />
            {replies > 0 && replies}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentItem;
