import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Post {
  id: string;
  space_id: string;
  author_id: string;
  title: string;
  body: string | null;
  image_url?: string | null;
  media_url?: string | null;
  is_hidden: boolean | null;
  created_at: string;
  author?: {
    username: string | null;
    avatar_url: string | null;
  };
  space?: {
    name: string;
    slug: string;
  };
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

export const usePosts = (options?: { spaceId?: string; authorId?: string; feed?: 'trending' | 'following' | 'all' }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(username, avatar_url),
        space:spaces!space_id(name, slug)
      `)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (options?.spaceId) {
      query = query.eq('space_id', options.spaceId);
    }

    if (options?.authorId) {
      query = query.eq('author_id', options.authorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      return;
    }

    // Get user's liked and saved posts, and counts
    let likedPostIds: string[] = [];
    let savedPostIds: string[] = [];
    const postLikeCounts: Record<string, number> = {};
    const postCommentCounts: Record<string, number> = {};
    
    const rows: Post[] = Array.isArray(data) ? (data as Post[]) : [];
    if (rows.length > 0) {
      const postIds = rows.map((p) => p.id);
      
      // Get like counts
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds);
      
      if (likesData) {
        likesData.forEach((like) => {
          postLikeCounts[like.post_id] = (postLikeCounts[like.post_id] || 0) + 1;
        });
      }
      
      // Get comment counts
      const { data: commentsData } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds)
        .eq('is_hidden', false);
      
      if (commentsData) {
        commentsData.forEach((comment) => {
          postCommentCounts[comment.post_id] = (postCommentCounts[comment.post_id] || 0) + 1;
        });
      }
      
      // Get user's liked and saved posts
      if (user) {
        const [likesResult, savedResult] = await Promise.all([
          supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
          supabase.from('saved_posts').select('post_id').eq('user_id', user.id).in('post_id', postIds)
        ]);
        
        likedPostIds = likesResult.data?.map(l => l.post_id) || [];
        savedPostIds = savedResult.data?.map(s => s.post_id) || [];
      }
    }

    const formattedPosts: Post[] = rows.map((post) => ({
      ...post,
      likes_count: postLikeCounts[post.id] || 0,
      comments_count: postCommentCounts[post.id] || 0,
      is_liked: likedPostIds.includes(post.id),
      is_saved: savedPostIds.includes(post.id),
    }));

    // Sort by likes for trending
    if (options?.feed === 'trending') {
      formattedPosts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    }

    setPosts(formattedPosts);
    setLoading(false);
  }, [user, options?.spaceId, options?.authorId, options?.feed]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (data: {
    space_id: string;
    title: string;
    body?: string;
    media_url?: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in to create a post');
      return null;
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        ...data,
        author_id: user.id
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create post: ' + error.message);
      return null;
    }

    toast.success('Post created!');
    fetchPosts();
    return post;
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      toast.error('Failed to delete post');
      return false;
    }

    toast.success('Post deleted');
    fetchPosts();
    return true;
  };

  const likePost = async (postId: string) => {
    if (!user) {
      toast.error('You must be logged in to like posts');
      return false;
    }

    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: user.id
      });

    if (error) {
      if (error.code === '23505') {
        // Already liked, unlike it
        return unlikePost(postId);
      }
      toast.error('Failed to like post');
      return false;
    }

    fetchPosts();
    return true;
  };

  const unlikePost = async (postId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to unlike post');
      return false;
    }

    fetchPosts();
    return true;
  };

  const savePost = async (postId: string) => {
    if (!user) {
      toast.error('You must be logged in to save posts');
      return false;
    }

    const { error } = await supabase
      .from('saved_posts')
      .insert({
        post_id: postId,
        user_id: user.id
      });

    if (error) {
      if (error.code === '23505') {
        return unsavePost(postId);
      }
      toast.error('Failed to save post');
      return false;
    }

    toast.success('Post saved!');
    fetchPosts();
    return true;
  };

  const unsavePost = async (postId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to unsave post');
      return false;
    }

    toast.success('Post removed from saved');
    fetchPosts();
    return true;
  };

  return {
    posts,
    loading,
    createPost,
    deletePost,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    refetch: fetchPosts
  };
};
