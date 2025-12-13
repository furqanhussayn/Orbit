import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { SpaceCard } from '@/components/SpaceCard';
import { GlassCard } from '@/components/GlassCard';
import { CosmicButton } from '@/components/CosmicButton';
import { useSpaces } from '@/hooks/useSpaces';
import { Search, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const tabsMobile = ['Joined', 'Discover'] as const;
const tabsDesktop = ['Discover'] as const;

const Spaces = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('Discover');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpace, setNewSpace] = useState({ name: '', slug: '', description: '', nsfw: false });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { spaces, loading, joinSpace, leaveSpace, createSpace } = useSpaces();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setActiveTab(isMobile ? 'Joined' : 'Discover');
  }, [isMobile]);

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'Joined') return matchesSearch && space.is_joined;
    if (activeTab === 'Discover') return matchesSearch && !space.is_joined;
    return matchesSearch;
  });

  const handleCreateSpace = async () => {
    if (!newSpace.name) {
      toast.error('Please enter a space name');
      return;
    }
    
    const slug = (newSpace.slug || newSpace.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const result = await createSpace({
      name: newSpace.name,
      slug,
      description: newSpace.description,
      nsfw: newSpace.nsfw
    });

    if (result) {
      setShowCreateModal(false);
      setNewSpace({ name: '', slug: '', description: '', nsfw: false });
    }
  };

  return (
    <div className="min-h-screen relative bg-background">
      <Sidebar />
      
      <main className="lg:ml-64 pb-24 lg:pb-8">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-primary">Spaces</h1>
              <CosmicButton onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Space
              </CosmicButton>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border/50">
            {(isMobile ? tabsMobile : tabsDesktop).map((tab) => (
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

        {/* Spaces Grid */}
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredSpaces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {activeTab === 'Joined' 
                  ? "You haven't joined any spaces yet. Discover some!" 
                  : "No spaces found. Create the first one!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  id={space.id}
                  name={space.name}
                  description={space.description || ''}
                  banner={space.banner_url || 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800'}
                  icon={space.icon_url || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=100'}
                  members={space.member_count || 0}
                  posts={space.post_count || 0}
                  isJoined={space.is_joined}
                  onClick={() => navigate(`/space/${space.id}`)}
                  onJoin={() => space.is_joined ? leaveSpace(space.id) : joinSpace(space.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <MobileNav />

      {/* Create Space Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
          <GlassCard className="relative w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create Space</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Space Name</label>
                <input
                  type="text"
                  placeholder="My Awesome Space"
                  value={newSpace.name}
                  onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Description</label>
                <textarea
                  placeholder="What's your space about?"
                  value={newSpace.description}
                  onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSpace.nsfw}
                  onChange={(e) => setNewSpace({ ...newSpace, nsfw: e.target.checked })}
                  className="appearance-none w-5 h-5 rounded-md border border-primary bg-muted checked:bg-primary checked:border-primary accent-primary"
                />
                <span className="text-sm">NSFW content (18+ only)</span>
              </label>

              <CosmicButton onClick={handleCreateSpace} className="w-full">
                Create Space
              </CosmicButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Spaces;
