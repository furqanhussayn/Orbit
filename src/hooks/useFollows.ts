import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FollowStats {
  followers: number;
  following: number;
}

export const useFollows = (targetUserId?: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);

  const checkFollowing = async (userId: string) => {
    if (!user || !userId) {
      setIsFollowing(false);
      return;
    }

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const fetchStats = async (userId: string) => {
    const [followersResult, followingResult] = await Promise.all([
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId),
    ]);

    setStats({
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
    });
  };

  useEffect(() => {
    if (targetUserId) {
      setLoading(true);
      Promise.all([
        checkFollowing(targetUserId),
        fetchStats(targetUserId),
      ]).finally(() => setLoading(false));
    } else {
      setStats({ followers: 0, following: 0 });
      setIsFollowing(false);
      setLoading(false);
    }
  }, [targetUserId, user]);

  const followUser = async (targetUserId: string) => {
    if (!user) {
      toast.error('You must be logged in to follow users');
      return false;
    }

    if (user.id === targetUserId) {
      toast.error('You cannot follow yourself');
      return false;
    }

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId,
      });

    if (error) {
      if (error.code === '23505') {
        toast.info('You are already following this user');
      } else {
        toast.error('Failed to follow user: ' + error.message);
      }
      return false;
    }

    toast.success('User followed!');
    await checkFollowing(targetUserId);
    await fetchStats(targetUserId);
    return true;
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);

    if (error) {
      toast.error('Failed to unfollow user: ' + error.message);
      return false;
    }

    toast.success('User unfollowed');
    await checkFollowing(targetUserId);
    await fetchStats(targetUserId);
    return true;
  };

  const toggleFollow = async (targetUserId: string) => {
    if (isFollowing) {
      return await unfollowUser(targetUserId);
    } else {
      return await followUser(targetUserId);
    }
  };

  return {
    isFollowing,
    stats,
    loading,
    followUser,
    unfollowUser,
    toggleFollow,
    checkFollowing,
    refetch: targetUserId ? () => {
      if (targetUserId) {
        checkFollowing(targetUserId);
        fetchStats(targetUserId);
      }
    } : undefined,
  };
};

// Hook to get users to follow (suggestions)
export const useFollowSuggestions = (limit: number = 10) => {
  const { user } = useAuth();
  type ProfileSuggestion = { id: string; username: string | null; avatar_url: string | null; bio: string | null };
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Get users that the current user is not following
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map((f) => f.following_id) || [];
      followingIds.push(user.id); // Exclude self

      // Fetch more profiles than needed to account for filtering
      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .limit(limit * 3); // Fetch more to filter out

      if (error) {
        console.error('Error fetching suggestions:', error);
        setLoading(false);
        return;
      }

      // Filter out users we're already following or ourselves
      const filtered = (allProfiles || []).filter(
        (profile) => !followingIds.includes(profile.id)
      );

      // Take only the limit we need
      const data = filtered.slice(0, limit);

      if (error) {
        console.error('Error fetching suggestions:', error);
        setLoading(false);
        return;
      }

      setSuggestions(data || []);
      setLoading(false);
    };

    fetchSuggestions();
  }, [user, limit]);

  return { suggestions, loading };
};

