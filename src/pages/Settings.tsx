import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen relative bg-background">
      <Sidebar />

      <main className="lg:ml-64 pb-24 lg:pb-8">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-primary">Account Details</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Info</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="text-foreground font-medium">Email:</span> {profile?.email || '—'}</p>
              <p><span className="text-foreground font-medium">Age:</span> {profile?.age_group === '18plus' ? '18+' : 'Under 18'}</p>
              <p><span className="text-foreground font-medium">Username:</span> {profile?.username || '—'}</p>
            </div>
          </GlassCard>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Settings;
