import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { PostCard } from '@/components/PostCard';
import { SpaceCard } from '@/components/SpaceCard';
import { GlassCard } from '@/components/GlassCard';
import { CosmicButton } from '@/components/CosmicButton';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useSpaces } from '@/hooks/useSpaces';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const Explore = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [spaceResults, setSpaceResults] = useState<any[]>([]);
  const [postResults, setPostResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { spaces, loading: spacesLoading, joinSpace, leaveSpace } = useSpaces();
  const { posts: trendingPosts, loading: trendingLoading, likePost, savePost } = usePosts({ feed: 'trending' });

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: false });
  };

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setSpaceResults([]);
      setPostResults([]);
      return;
    }
    setLoading(true);

    const [spacesQry, postsQry] = await Promise.all([
      supabase
        .from('spaces')
        .select('*')
        .ilike('name', `%${q}%`)
        .limit(20),
      supabase
        .from('posts')
        .select(`
          *,
          author:profiles!author_id(username, avatar_url),
          space:spaces!space_id(name, slug)
        `)
        .or(`title.ilike.%${q}%,body.ilike.%${q}%`)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const spacesData = spacesQry.data || [];
    const postData = postsQry.data || [];

    const ids = postData.map((p: any) => p.id);
    let likeCounts: Record<string, number> = {};
    let commentCounts: Record<string, number> = {};
    let likedIdsForUser: string[] = [];
    let savedIdsForUser: string[] = [];

    if (ids.length > 0) {
      const [{ data: likesData }, { data: commentsData }] = await Promise.all([
        supabase.from('post_likes').select('post_id').in('post_id', ids),
        supabase.from('comments').select('post_id').in('post_id', ids).eq('is_hidden', false),
      ]);
      likesData?.forEach((l: any) => { likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1; });
      commentsData?.forEach((c: any) => { commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1; });
      if (user) {
        const [userLikes, userSaved] = await Promise.all([
          supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', ids),
          supabase.from('saved_posts').select('post_id').eq('user_id', user.id).in('post_id', ids),
        ]);
        likedIdsForUser = userLikes.data?.map((d: any) => d.post_id) || [];
        savedIdsForUser = userSaved.data?.map((d: any) => d.post_id) || [];
      }
    }

    const formattedPosts = postData.map((post: any) => ({
      ...post,
      likes_count: likeCounts[post.id] || 0,
      comments_count: commentCounts[post.id] || 0,
      is_liked: likedIdsForUser.includes(post.id),
      is_saved: savedIdsForUser.includes(post.id),
    }));

    setSpaceResults(spacesData);
    setPostResults(formattedPosts);
    setLoading(false);
  };

  useEffect(() => {
    setSearchParams(query ? { q: query } : {});
    performSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const showingResults = query.trim().length > 0;

  return (
    <div className="min-h-screen relative bg-background">
      <Sidebar />

      <motion.main className="lg:ml-64 pb-24 lg:pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-primary">{showingResults ? 'Explore' : 'Hot Topics'}</h1>
            <div className="flex items-center gap-4 w-full max-w-xl justify-end">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search spaces and posts..."
                  className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
          {showingResults ? (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-3">Spaces</h2>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : spaceResults.length === 0 ? (
                  <p className="text-muted-foreground">No matching spaces found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {spaceResults.map((s) => (
                      <SpaceCard
                        key={s.id}
                        id={s.id}
                        name={s.name}
                        description={s.description || ''}
                        banner={s.banner_url || 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800'}
                        icon={s.icon_url || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200'}
                        members={s.member_count || 0}
                        posts={s.post_count || 0}
                        isJoined={false}
                        onClick={() => {}}
                        onJoin={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Posts</h2>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : postResults.length === 0 ? (
                  <p className="text-muted-foreground">No matching posts found.</p>
                ) : (
                  <div className="max-w-2xl space-y-6">
                    {postResults.map((post) => (
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
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="max-w-2xl space-y-6">
              {trendingLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : trendingPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts yet. Join some spaces and start exploring!</p>
                </div>
              ) : (
                trendingPosts.map((post) => (
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
                  />
                ))
              )}
            </div>
          )}
        </div>
      </motion.main>

      <MobileNav />
    </div>
  );
};

export default Explore;
