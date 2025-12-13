import { useState } from 'react';
import { Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { PostCard } from '@/components/PostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const tabs = ['For You', 'Trending'];

const HomeFeed = () => {
  const [activeTab, setActiveTab] = useState('For You');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const feedType = activeTab === 'Trending' ? 'trending' : 'all';
  const { posts, loading, likePost, savePost, deletePost, refetch } = usePosts({ feed: feedType as any });

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: false });
  };

  return (
    <div className="min-h-screen relative bg-background">
      <Sidebar />
      
      {/* Main content */}
      <main className="lg:ml-64 pb-24 lg:pb-8">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-primary">Home</h1>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  onFocus={() => navigate('/explore')}
                  placeholder="Search Orbit..."
                  className="w-64 pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Link to="/profile" className="block">
                <img
                  src={profile?.avatar_url || "/avatar.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-primary/30 object-cover"
                />
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border/50">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-3 text-sm font-medium transition-colors relative',
                  activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Feed */}
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Join some spaces and start exploring!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                author={{
                  name: post.author?.username || 'Unknown',
                  avatar: post.author?.avatar_url || '/avatar.png',
                  handle: post.author?.username || 'unknown',
                  id: post.author_id
                }}
                content={post.body || post.title}
                image={post.media_url || undefined}
                likes={post.likes_count || 0}
                comments={post.comments_count || 0}
                isLiked={post.is_liked}
                isBookmarked={post.is_saved}
                createdAt={formatTime(post.created_at)}
                spaceName={post.space?.name}
                onLike={() => likePost(post.id)}
                onSave={() => savePost(post.id)}
                onDelete={() => deletePost(post.id)}
              />
            ))
          )}
        </div>
      </main>

      <MobileNav />
      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={() => {
          refetch();
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default HomeFeed;
