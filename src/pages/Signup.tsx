import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { OrbitLogo } from '@/components/OrbitLogo';
import { GlassCard } from '@/components/GlassCard';
import { CosmicButton } from '@/components/CosmicButton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { useSpaces } from '@/hooks/useSpaces';
import { supabase } from '@/integrations/supabase/client';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  ageGroup: z.enum(['under18', '18plus'])
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    ageGroup: '' as 'under18' | '18plus' | ''
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const { joinSpace } = useSpaces();

  // Redirect if already logged in
  if (user) {
    navigate('/home', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (step === 1) {
      if (!formData.ageGroup) {
        setErrors({ ageGroup: 'Please select your age group' });
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (interests.length < 2) {
        setErrors({ interests: 'Select at least 2 interests' });
        return;
      }
      setStep(3);
      return;
    }

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signUp(
      formData.email, 
      formData.password, 
      formData.username,
      formData.ageGroup as 'under18' | '18plus'
    );
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please sign in.');
      } else {
        toast.error(error.message);
      }
      return;
    }

    const { data: authUser } = await supabase.auth.getUser();
    const uid = authUser.user?.id;
    if (uid) {
      await supabase.from('profiles').update({ age_group: formData.ageGroup }).eq('id', uid);
    }

    const under18SlugMap: Record<string, string> = {
      'Gaming': 'gaming',
      'Music': 'music',
      'Movies and TV Shows': 'movies-and-tv-shows',
      'Books': 'books',
      'Learn Programming': 'learn-programming',
      'Art': 'arts',
    };
    const adultSlugMap: Record<string, string> = {
      'Learn Programming': 'learn-programming',
      'J*bs and Careers': 'jbs-and-careers',
      'Deep dive in Dark Web': 'deep-dive-in-dark-web',
      'Music': 'music',
      'Relationship Advice': 'relationship-advices',
      'Books': 'books',
    };
    const slugMap = formData.ageGroup === '18plus' ? adultSlugMap : under18SlugMap;
    const selectedSlugs = interests.map((i) => slugMap[i]).filter(Boolean);
    if (selectedSlugs.length > 0) {
      const { data: spacesToJoin } = await supabase
        .from('spaces')
        .select('id, slug, nsfw')
        .in('slug', selectedSlugs);
      for (const s of spacesToJoin || []) {
        if (s.nsfw && formData.ageGroup !== '18plus') continue;
        await joinSpace(s.id);
      }
    }

    toast.success('Account created! Welcome to Orbit.');
    navigate('/home');
  };

  const under18Interests = ['Gaming', 'Music', 'Movies and TV Shows', 'Books', 'Learn Programming', 'Art'];
  const adultInterests = ['Learn Programming', 'J*bs and Careers', 'Deep dive in Dark Web', 'Music', 'Relationship Advice', 'Books'];

  const renderedInterests = formData.ageGroup === '18plus' ? adultInterests : under18Interests;

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-background">
      {/* Subtle gradient backgrounds */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8">
          <OrbitLogo size="lg" />
        </Link>

        <GlassCard hover={false} className="p-8">
          <h1 className="text-2xl font-bold text-center mb-2">
            {step === 1 ? 'Select Your Age' : step === 2 ? 'Choose Your Interests' : 'One Last Step'}
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            {step === 1 ? 'Pick your age group to personalize your experience' : step === 2 ? 'Select at least 2 interests' : 'Create your account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Age Group</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ageGroup"
                        value="under18"
                        checked={formData.ageGroup === 'under18'}
                        onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as 'under18' })}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">Under 18</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ageGroup"
                        value="18plus"
                        checked={formData.ageGroup === '18plus'}
                        onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as '18plus' })}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">18+</span>
                    </label>
                  </div>
                  {errors.ageGroup && <p className="text-sm text-destructive mt-1">{errors.ageGroup}</p>}
                </div>
                <CosmicButton type="submit" className="w-full">
                  Next
                </CosmicButton>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {renderedInterests.map((i) => {
                    const active = interests.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleInterest(i)}
                        className={`px-4 py-2 rounded-xl border ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/50 text-foreground'}`}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
                {errors.interests && <p className="text-sm text-destructive">{errors.interests}</p>}
                <div className="flex items-center justify-between">
                  <CosmicButton type="button" variant="glass" onClick={() => setStep(1)}>
                    Back
                  </CosmicButton>
                  <CosmicButton type="submit">
                    Next
                  </CosmicButton>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  {errors.username && <p className="text-sm text-destructive mt-1">{errors.username}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <CosmicButton type="button" variant="glass" onClick={() => setStep(2)}>
                    Back
                  </CosmicButton>
                  <CosmicButton type="submit" className="min-w-32" disabled={loading}>
                    {loading ? 'Creating…' : 'Sign Up'}
                  </CosmicButton>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Signup;
