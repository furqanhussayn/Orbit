import { motion } from 'framer-motion';
import { Users, Star } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CosmicButton } from './CosmicButton';

interface SpaceCardProps {
  id: string;
  name: string;
  description: string;
  banner: string;
  icon: string;
  members: number;
  posts: number;
  isJoined?: boolean;
  onClick?: () => void;
  onJoin?: () => void;
}

export const SpaceCard = ({
  name,
  description,
  banner,
  icon,
  members,
  posts,
  isJoined = false,
  onClick,
  onJoin
}: SpaceCardProps) => {
  return (
    <GlassCard 
      className="overflow-hidden p-0 cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Banner */}
      <div className="relative h-32 overflow-hidden">
        <img 
          src={banner} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Space icon */}
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 rounded-2xl border-4 border-card overflow-hidden bg-card">
            <img src={icon} alt={name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg text-foreground">{name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {members.toLocaleString()} members
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {posts} posts
              </span>
            </div>
          </div>
          <CosmicButton
            variant={isJoined ? 'outline' : 'primary'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.();
            }}
          >
            {isJoined ? 'Joined' : 'Join'}
          </CosmicButton>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>
    </GlassCard>
  );
};

export default SpaceCard;
