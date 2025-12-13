import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useReports = () => {
  const { user } = useAuth();

  const reportContent = async (
    targetType: 'post' | 'comment' | 'user' | 'space',
    targetId: string,
    reason: string
  ) => {
    if (!user) {
      toast.error('You must be logged in to report content');
      return false;
    }

    const { error } = await supabase
      .from('reports')
      .insert({
        target_type: targetType,
        target_id: targetId,
        reporter_id: user.id,
        reason
      });

    if (error) {
      toast.error('Failed to submit report');
      return false;
    }

    toast.success('Report submitted. Thank you for helping keep Orbit safe.');
    return true;
  };

  return { reportContent };
};
