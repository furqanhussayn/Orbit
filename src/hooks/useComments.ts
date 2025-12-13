import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  body: string;
  is_hidden: boolean;
  created_at: string;
  author?: {
    username: string | null;
    avatar_url: string | null;
  };
  likes_count?: number;
  is_liked?: boolean;
  replies?: Comment[];
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = async () => {
    if (!postId) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles!author_id(username, avatar_url)
      `)
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
      return;
    }

    // Get user's liked comments and like counts
    let likedCommentIds: string[] = [];
    let commentLikeCounts: Record<string, number> = {};
    
    if (user && data) {
      const commentIds = data.map(c => c.id);
      
      // Get user's liked comments
      const { data: likesData } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);
      
      likedCommentIds = likesData?.map(l => l.comment_id) || [];
      
      // Get like counts for all comments
      const { data: countsData } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .in('comment_id', commentIds);
      
      if (countsData) {
        countsData.forEach(like => {
          commentLikeCounts[like.comment_id] = (commentLikeCounts[like.comment_id] || 0) + 1;
        });
      }
    } else if (data) {
      // Even if not logged in, get like counts
      const commentIds = data.map(c => c.id);
      const { data: countsData } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .in('comment_id', commentIds);
      
      if (countsData) {
        countsData.forEach(like => {
          commentLikeCounts[like.comment_id] = (commentLikeCounts[like.comment_id] || 0) + 1;
        });
      }
    }

    // Format and organize nested comments
    const formattedComments = data?.map(comment => ({
      ...comment,
      likes_count: commentLikeCounts[comment.id] || 0,
      is_liked: likedCommentIds.includes(comment.id)
    })) || [];

    // Organize into tree structure
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    formattedComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    formattedComments.forEach(comment => {
      const formattedComment = commentMap.get(comment.id)!;
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(formattedComment);
        }
      } else {
        rootComments.push(formattedComment);
      }
    });

    setComments(rootComments);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [postId, user]);

  const createComment = async (body: string, parentCommentId?: string) => {
    if (!user) {
      toast.error('You must be logged in to comment');
      return null;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        body,
        parent_comment_id: parentCommentId || null
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to post comment');
      return null;
    }

    toast.success('Comment posted!');
    fetchComments();
    return data;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast.error('Failed to delete comment');
      return false;
    }

    toast.success('Comment deleted');
    fetchComments();
    return true;
  };

  const likeComment = async (commentId: string) => {
    if (!user) {
      toast.error('You must be logged in to like comments');
      return false;
    }

    const { error } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: user.id
      });

    if (error) {
      if (error.code === '23505') {
        return unlikeComment(commentId);
      }
      toast.error('Failed to like comment');
      return false;
    }

    fetchComments();
    return true;
  };

  const unlikeComment = async (commentId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to unlike comment');
      return false;
    }

    fetchComments();
    return true;
  };

  return {
    comments,
    loading,
    createComment,
    deleteComment,
    likeComment,
    unlikeComment,
    refetch: fetchComments
  };
};
