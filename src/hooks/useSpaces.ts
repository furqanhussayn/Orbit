import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Space {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  icon_url: string | null;
  creator_id: string | null;
  nsfw: boolean;
  created_at: string;
  member_count?: number;
  post_count?: number;
  is_joined?: boolean;
}

export const useSpaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchSpaces = async () => {
    setLoading(true);
    
    // Get spaces with member count
    const { data: spacesData, error } = await supabase
      .from('spaces')
      .select(`
        *,
        space_members(count),
        posts(count)
      `);

    if (error) {
      console.error('Error fetching spaces:', error);
      setLoading(false);
      return;
    }

    // Get user's joined spaces
    let joinedSpaceIds: string[] = [];
    if (user) {
      const { data: memberData } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', user.id);
      
      joinedSpaceIds = memberData?.map(m => m.space_id) || [];
    }

    const formattedSpaces = spacesData?.map(space => ({
      ...space,
      member_count: (space.space_members as any)?.[0]?.count || 0,
      post_count: (space.posts as any)?.[0]?.count || 0,
      is_joined: joinedSpaceIds.includes(space.id)
    })) || [];

    setSpaces(formattedSpaces);
    setLoading(false);
  };

  useEffect(() => {
    fetchSpaces();
  }, [user]);

  const createSpace = async (data: {
    name: string;
    slug: string;
    description?: string;
    nsfw?: boolean;
  }) => {
    if (!user) {
      toast.error('You must be logged in to create a space');
      return null;
    }

    const { data: space, error } = await supabase
      .from('spaces')
      .insert({
        ...data,
        creator_id: user.id
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create space: ' + error.message);
      return null;
    }

    // Auto-join the space
    await joinSpace(space.id);
    
    toast.success('Space created successfully!');
    fetchSpaces();
    return space;
  };

  const joinSpace = async (spaceId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a space');
      return false;
    }

    const { error } = await supabase
      .from('space_members')
      .insert({
        space_id: spaceId,
        user_id: user.id
      });

    if (error) {
      if (error.code === '23505') {
        toast.info('You are already a member of this space');
      } else {
        toast.error('Failed to join space');
      }
      return false;
    }

    toast.success('Joined space successfully!');
    fetchSpaces();
    return true;
  };

  const leaveSpace = async (spaceId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('space_members')
      .delete()
      .eq('space_id', spaceId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to leave space');
      return false;
    }

    toast.success('Left space successfully');
    fetchSpaces();
    return true;
  };

  return {
    spaces,
    loading,
    createSpace,
    joinSpace,
    leaveSpace,
    refetch: fetchSpaces
  };
};

export const useSpace = (id: string) => {
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSpace = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          space_members(count),
          posts(count)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching space:', error);
        setLoading(false);
        return;
      }

      let isJoined = false;
      if (user && data) {
        const { data: memberData } = await supabase
          .from('space_members')
          .select('id')
          .eq('space_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        isJoined = !!memberData;
      }

      if (data) {
        setSpace({
          ...data,
          member_count: (data.space_members as any)?.[0]?.count || 0,
          post_count: (data.posts as any)?.[0]?.count || 0,
          is_joined: isJoined
        });
      }
      
      setLoading(false);
    };

    if (id) {
      fetchSpace();
    }
  }, [id, user]);

  return { space, loading };
};
