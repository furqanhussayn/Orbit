import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Star, Flag, X, Trash, PlusCircle } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { PostCard } from '@/components/PostCard';
import { CosmicButton } from '@/components/CosmicButton';
import { GlassCard } from '@/components/GlassCard';
import { useSpace, useSpaces } from '@/hooks/useSpaces';
import { usePosts } from '@/hooks/usePosts';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { CreatePostModal } from '@/components/CreatePostModal';
import { supabase } from '@/integrations/supabase/client';
import { EditSpaceModal } from '@/components/EditSpaceModal';

const tabs = ['Posts', 'About', 'Members'];

const SpaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('Posts');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  type ProfileLite = { id: string; username: string | null; avatar_url: string | null };
  const [members, setMembers] = useState<ProfileLite[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isEditSpaceOpen, setIsEditSpaceOpen] = useState(false);
  
  const { space, loading: spaceLoading, refetch: refetchSpace } = useSpace(id || '');
  const { spaces, joinSpace, leaveSpace, deleteSpace } = useSpaces();
  const { posts, loading: postsLoading, likePost, savePost, deletePost } = usePosts({ spaceId: id });
  const { reportContent } = useReports();
  const { user } = useAuth();
  const joinedSpaces = spaces.filter((s) => s.is_joined);

  const handleJoinLeave = async () => {
    if (!space) return;
    if (space.is_joined) {
      await leaveSpace(space.id);
    } else {
      await joinSpace(space.id);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    if (id) {
      await reportContent('space', id, reportReason);
      setShowReportModal(false);
      setReportReason('');
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: false });
  };

  const fetchMembers = async () => {
    if (!id) return;
    setMembersLoading(true);
    const { data: memberRows, error } = await supabase
      .from('space_members')
      .select('user_id')
      .eq('space_id', id);
    if (error) {
      setMembers([]);
      setMembersLoading(false);
      return;
    }
    const userIds = (memberRows || []).map((r: { user_id: string }) => r.user_id);
    if (userIds.length === 0) {
      setMembers([]);
      setMembersLoading(false);
      return;
    }
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);
    setMembers((profiles || []) as ProfileLite[]);
    setMembersLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'Members') {
      fetchMembers();
    }
  }, [activeTab, id]);

  if (spaceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Space not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-background">
      <Sidebar />
      
      <main className="lg:ml-64 pb-24 lg:pb-8">
        {/* Back button */}
        <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border/50 px-4 py-3">
          <Link to="/spaces" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Spaces</span>
          </Link>
        </div>

        {/* Banner */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img 
            src={space.banner_url || 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200'} 
            alt={space.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Space info */}
        <div className="px-6 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            <div className="w-24 h-24 rounded-2xl border-4 border-background overflow-hidden bg-card">
              <img 
                src={space.icon_url || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200'} 
                alt={space.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{space.name}</h1>
              {space.nsfw && (
                <span className="inline-block px-2 py-1 text-xs bg-destructive/20 text-destructive rounded mt-1">
                  18+ NSFW
                </span>
              )}
              <div className="flex items-center gap-4 text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {(space.member_count || 0).toLocaleString()} members
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {(space.post_count || 0).toLocaleString()} posts
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CosmicButton
                variant={space.is_joined ? 'outline' : 'primary'}
                onClick={handleJoinLeave}
              >
                {space.is_joined ? 'Leave' : 'Join Space'}
              </CosmicButton>
              {space.is_joined && (
                <CosmicButton onClick={() => setIsCreateModalOpen(true)}>
                  Create Post
                </CosmicButton>
              )}
              {user?.id !== space.creator_id && (
                <CosmicButton variant="glass" className="px-3" onClick={() => setShowReportModal(true)}>
                  <Flag className="w-5 h-5" />
                </CosmicButton>
              )}
              {user?.id && space.creator_id === user.id && (
                <>
                  <CosmicButton onClick={() => setIsEditSpaceOpen(true)}>
                    Edit Space
                  </CosmicButton>
                  <CosmicButton
                    variant="glass"
                    className="px-3"
                    onClick={async () => {
                      const ok = confirm('Delete this space? This cannot be undone.');
                      if (!ok) return;
                      if (id) await deleteSpace(id);
                    }}
                  >
                    <Trash className="w-5 h-5" />
                  </CosmicButton>
                </>
              )}
            </div>
          </div>

          <p className="text-muted-foreground max-w-2xl mb-6 whitespace-pre-line">{space.description}</p>

          {/* Tabs */}
          <div className="flex border-b border-border/50 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-6 py-3 text-sm font-medium transition-colors relative',
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

          {/* Content */}
          {activeTab === 'Posts' && (
            <div className="max-w-2xl space-y-6">
              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts in this space yet. Be the first to post!</p>
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
          )}

          {activeTab === 'About' && (
            <GlassCard className="max-w-2xl p-6">
              <h3 className="text-xl font-bold mb-4">About this Space</h3>
              <p className="text-muted-foreground mb-6 whitespace-pre-line">{space.description || 'No description provided.'}</p>
              
              <div className="text-sm text-muted-foreground">
                <p>Created: {new Date(space.created_at).toLocaleDateString()}</p>
              </div>
            </GlassCard>
          )}

          {activeTab === 'Members' && (
            <GlassCard className="max-w-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Members</h3>
              {membersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <p className="text-muted-foreground">No members yet.</p>
              ) : (
                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <img
                        src={m.avatar_url || '/avatar.png'}
                        alt={m.username || 'User'}
                        className="w-8 h-8 rounded-full border border-border/50 object-cover"
                      />
                      <span className="text-sm">{m.username || 'Unknown'}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </main>

      {/* Floating Create Post (desktop) */}
      {joinedSpaces.length > 0 && (
        <Link to="/create" className="hidden lg:block fixed bottom-6 right-6 z-50">
          <CosmicButton className="flex items-center justify-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Create Post
          </CosmicButton>
        </Link>
      )}

      <MobileNav />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowReportModal(false)} />
          <GlassCard className="relative w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Report Space</h2>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              placeholder="Why are you reporting this space?"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-32 mb-4"
            />

            <CosmicButton onClick={handleReport} className="w-full">
              Submit Report
            </CosmicButton>
          </GlassCard>
        </div>
      )}
      {isEditSpaceOpen && space && (
        <EditSpaceModal
          isOpen={isEditSpaceOpen}
          onClose={() => setIsEditSpaceOpen(false)}
          space={{
            id: space.id,
            name: space.name,
            description: space.description,
            icon_url: space.icon_url,
            creator_id: space.creator_id
          }}
          onUpdated={() => {
            refetchSpace();
          }}
        />
      )}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultSpaceId={id || ''}
        hideSpaceSelector
        onSubmit={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default SpaceDetail;
