import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, Calendar, MapPin, LinkIcon, Edit2, LogOut } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { PostCard } from '@/components/PostCard';
import { CosmicButton } from '@/components/CosmicButton';
import { GlassCard } from '@/components/GlassCard';
import { EditProfileModal } from '@/components/EditProfileModal';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useFollows } from '@/hooks/useFollows';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const tabs = ['Posts', 'Likes', 'Saved'];

interface ProfileData {
  id: string;
  email: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  age_group: 'under18' | '18plus';
  created_at: string;
}

const Profile = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('Posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { user, profile, signOut } = useAuth();
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  
  // If viewing own profile or no userId specified
  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = isOwnProfile ? user?.id : userId || undefined;
  const profileToShow = isOwnProfile ? profile : viewingProfile;
  const { posts, loading, likePost, savePost } = usePosts({ 
    authorId: isOwnProfile ? user?.id : userId 
  });
  const { isFollowing, toggleFollow, stats } = useFollows(isOwnProfile ? user?.id : userId);

  // Fetch profile when viewing another user
  useEffect(() => {
    const fetchProfile = async () => {
      if (isOwnProfile || !userId) {
        setViewingProfile(null);
        return;
      }

      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setViewingProfile(data as ProfileData | null);
      }
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [userId, isOwnProfile]);

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: false });
  };

  const fetchFormattedPostsByIds = async (postIds: string[]) => {
    if (!postIds.length) return [];
    const { data: postsData } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(username, avatar_url),
        space:spaces!space_id(name, slug)
      `)
      .in('id', postIds)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (!postsData || postsData.length === 0) return [];

    const ids = postsData.map(p => p.id);

    const [{ data: likesData }, { data: commentsData }] = await Promise.all([
      supabase.from('post_likes').select('post_id').in('post_id', ids),
      supabase.from('comments').select('post_id').in('post_id', ids).eq('is_hidden', false)
    ]);

    const likeCounts: Record<string, number> = {};
    const commentCounts: Record<string, number> = {};
    likesData?.forEach(l => { likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1; });
    commentsData?.forEach(c => { commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1; });

    let likedIdsForUser: string[] = [];
    let savedIdsForUser: string[] = [];
    if (user) {
      const [userLikes, userSaved] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', ids),
        supabase.from('saved_posts').select('post_id').eq('user_id', user.id).in('post_id', ids)
      ]);
      likedIdsForUser = userLikes.data?.map(d => d.post_id) || [];
      savedIdsForUser = userSaved.data?.map(d => d.post_id) || [];
    }

    return postsData.map(post => ({
      ...post,
      likes_count: likeCounts[post.id] || 0,
      comments_count: commentCounts[post.id] || 0,
      is_liked: likedIdsForUser.includes(post.id),
      is_saved: savedIdsForUser.includes(post.id)
    }));
  };

  const fetchLikedPosts = async () => {
    if (!targetUserId) {
      setLikedPosts([]);
      return;
    }
    setLoadingLikes(true);
    const { data: liked } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', targetUserId);
    const ids = liked?.map(l => l.post_id) || [];
    const formatted = await fetchFormattedPostsByIds(ids);
    setLikedPosts(formatted);
    setLoadingLikes(false);
  };

  const fetchSavedPosts = async () => {
    if (!targetUserId) {
      setSavedPosts([]);
      return;
    }
    setLoadingSaved(true);
    const { data: saved } = await supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', targetUserId);
    const ids = saved?.map(s => s.post_id) || [];
    const formatted = await fetchFormattedPostsByIds(ids);
    setSavedPosts(formatted);
    setLoadingSaved(false);
  };

  useEffect(() => {
    if (activeTab === 'Likes') {
      fetchLikedPosts();
    } else if (activeTab === 'Saved') {
      fetchSavedPosts();
    }
  }, [activeTab, user]);

  return (
    <div className="min-h-screen relative bg-background">
      <Sidebar />
      
      <main className="lg:ml-64 pb-24 lg:pb-8">
        {/* Banner */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Settings button */}
          {isOwnProfile && (
            <Link to="/settings" className="absolute top-4 right-4">
              <button className="p-2 bg-card/50 backdrop-blur-sm rounded-xl hover:bg-card/70 transition-colors" aria-label="Open Settings">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
          )}
        </div>

        {/* Profile info */}
        <div className="px-6 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-card">
                <img 
                  src={profileToShow?.avatar_url || "/avatar.png"} 
                  alt={profileToShow?.username || 'Profile'} 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profileToShow?.username || 'User'}</h1>
              <p className="text-muted-foreground">@{profileToShow?.username || 'user'}</p>
              {profileToShow && (
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{stats?.followers || 0}</span> Followers
                  </span>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{stats?.following || 0}</span> Following
                  </span>
                </div>
              )}
            </div>

            {isOwnProfile ? (
              <div className="flex gap-2">
                <CosmicButton 
                  className="flex items-center gap-2"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </CosmicButton>
                <CosmicButton variant="outline" onClick={signOut} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </CosmicButton>
              </div>
            ) : (
              <div className="flex gap-2">
                <CosmicButton 
                  className="flex items-center gap-2"
                  onClick={() => userId && toggleFollow(userId)}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </CosmicButton>
              </div>
            )}
          </div>

          {loadingProfile ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {profileToShow?.bio && (
                <p className="text-foreground/90 max-w-2xl mb-4">{profileToShow.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {profileToShow?.created_at ? new Date(profileToShow.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                </span>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex border-b border-border/50 mb-6">
            {(isOwnProfile ? tabs : tabs.filter(t => t !== 'Saved')).map((tab) => (
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

              {/* Posts */}
              <div className="space-y-6">
                {(activeTab === 'Likes' ? loadingLikes : activeTab === 'Saved' ? loadingSaved : loading) ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (activeTab === 'Likes' ? likedPosts : activeTab === 'Saved' ? (isOwnProfile ? savedPosts : []) : posts).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {activeTab === 'Likes' ? 'No liked posts yet' : activeTab === 'Saved' ? (isOwnProfile ? 'No saved posts yet' : 'Saved posts are private') : 'No posts yet'}
                    </p>
                  </div>
                ) : (
                  (activeTab === 'Likes' ? likedPosts : activeTab === 'Saved' ? (isOwnProfile ? savedPosts : []) : posts).map((post) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      author={{
                        name: post.author?.username || profileToShow?.username || 'Unknown',
                        avatar: post.author?.avatar_url || profileToShow?.avatar_url || '/avatar.png',
                        handle: post.author?.username || profileToShow?.username || 'unknown'
                      }}
                      spaceName={post.space?.name}
                      content={post.body || post.title}
                      image={post.media_url || undefined}
                      likes={post.likes_count || 0}
                      comments={post.comments_count || 0}
                      isLiked={post.is_liked}
                      isBookmarked={post.is_saved}
                      createdAt={formatTime(post.created_at)}
                      onLike={async () => {
                        await likePost(post.id);
                        if (activeTab === 'Likes') fetchLikedPosts();
                        if (activeTab === 'Saved') fetchSavedPosts();
                      }}
                      onSave={async () => {
                        await savePost(post.id);
                        if (activeTab === 'Likes') fetchLikedPosts();
                        if (activeTab === 'Saved') fetchSavedPosts();
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6" />
          </div>
        </div>
      </main>

      <MobileNav />
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default Profile;
