import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, X } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { GlassCard } from '@/components/GlassCard';
import { CosmicButton } from '@/components/CosmicButton';
import { Starfield } from '@/components/Starfield';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useSpaces } from '@/hooks/useSpaces';
import { toast } from 'sonner';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('');
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { spaces, loading: spacesLoading } = useSpaces();
  const { createPost } = usePosts();
  const joinedSpaces = spaces.filter((s) => s.is_joined);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    if (!selectedSpace) {
      toast.error('Please select a space');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a post');
      return;
    }

    const result = await createPost({
      space_id: selectedSpace,
      title: content.substring(0, 100),
      body: content,
    });

    if (result) {
      toast.success('Post created!');
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <Sidebar />
      
      <main className="lg:ml-64 pb-24 lg:pb-8">
        {/* Header */}
        <motion.header 
          className="sticky top-0 z-30 glass-strong border-b border-border/50 px-6 py-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-xl font-bold gradient-cosmic-text">Create Post</h1>
            <CosmicButton
              onClick={handleSubmit}
              disabled={!content.trim() || !selectedSpace || spacesLoading || joinedSpaces.length === 0}
              className="disabled:opacity-50"
            >
              Post
            </CosmicButton>
          </div>
        </motion.header>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <GlassCard hover={false}>
            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={profile?.avatar_url || "/avatar.png"}
                alt="Your avatar"
                className="w-12 h-12 rounded-full border-2 border-primary/30 object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold">{profile?.username || 'User'}</p>
                {joinedSpaces.length === 0 ? (
                  <div className="mt-2 px-4 py-2 rounded-xl bg-muted/50 border border-border text-muted-foreground">
                    Join spaces to start posting
                  </div>
                ) : (
                  <select
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mt-2"
                    disabled={spacesLoading}
                  >
                    <option value="">Select a space (required)</option>
                    {joinedSpaces.map((space) => (
                      <option key={space.id} value={space.id}>
                        {space.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Text input */}
            <textarea
              className="w-full h-48 bg-transparent border-none text-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Attachment preview area */}
            <div className="border-t border-border/50 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.button
                    className="p-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Image className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="2"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeDasharray={`${(content.length / 280) * 100}, 100`}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                      {280 - content.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default CreatePost;
