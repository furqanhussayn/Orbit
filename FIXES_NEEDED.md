# Detailed Fix Guide for Orbit App Features

This document outlines all the broken features and exactly what needs to be fixed.

## 🔴 CRITICAL ISSUES

### 1. **Creating Posts - NOT WORKING**

#### Problem:
- `CreatePost.tsx` only shows a toast notification but doesn't actually save posts to the database
- `CreatePostModal.tsx` doesn't create posts either
- Both components are missing the actual database integration

#### Files to Fix:

**File 1: `src/pages/CreatePost.tsx`**
- **Line 23-31**: The `handleSubmit` function needs to call `createPost` from `usePosts` hook
- **Line 14**: `selectedSpace` should be required (posts need a space_id)
- **Line 17-21**: Hardcoded spaces should be replaced with real spaces from database
- **Line 69-75**: Hardcoded user info should use actual logged-in user from `useAuth`

**File 2: `src/components/CreatePostModal.tsx`**
- **Line 13-22**: Needs to accept and use `createPost` function
- **Line 68-76**: Hardcoded user info should use actual logged-in user
- **Line 10**: `onSubmit` prop should create the post, not just call a callback

**File 3: `src/pages/HomeFeed.tsx`**
- **Line 114-121**: `CreatePostModal` onSubmit doesn't actually create posts

---

### 2. **Edit Profile - NOT WORKING**

#### Problem:
- The "Edit Profile" button in Profile page doesn't do anything
- No edit profile modal or form exists
- No way to update username, bio, or avatar

#### Files to Fix:

**File: `src/pages/Profile.tsx`**
- **Line 70-73**: "Edit Profile" button has no `onClick` handler
- **Missing**: Need to create an Edit Profile modal component
- **Missing**: Need to integrate with `updateProfile` from `useAuth` context

**New File Needed: `src/components/EditProfileModal.tsx`**
- Create a new modal component for editing profile
- Should allow editing: username, bio, avatar_url
- Should use `updateProfile` from `useAuth` context

---

### 3. **Spaces Integration - INCOMPLETE**

#### Problem:
- `CreatePost.tsx` uses hardcoded spaces instead of fetching from database
- No way to create new spaces
- Space selection doesn't work properly

#### Files to Fix:

**File: `src/pages/CreatePost.tsx`**
- **Line 17-21**: Replace hardcoded spaces with `useSpaces` hook
- **Line 76-87**: Space dropdown should use real spaces from database

---

### 4. **User Data - HARDCODED**

#### Problem:
- Multiple components use hardcoded user data instead of actual logged-in user
- Avatar URLs are hardcoded
- Usernames are hardcoded

#### Files to Fix:

**File 1: `src/pages/CreatePost.tsx`**
- **Line 69-75**: Replace hardcoded "Alex Rivera" with `profile?.username` from `useAuth`
- **Line 70**: Replace hardcoded avatar with `profile?.avatar_url`

**File 2: `src/components/CreatePostModal.tsx`**
- **Line 68-76**: Replace hardcoded user info with actual user from `useAuth`
- Need to import and use `useAuth` hook

---

## 📋 DETAILED FIX INSTRUCTIONS

### Fix 1: Make CreatePost.tsx Actually Create Posts

**Location:** `src/pages/CreatePost.tsx`

**Changes needed:**

1. **Import required hooks:**
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useSpaces } from '@/hooks/useSpaces';
import { toast } from 'sonner';
```

2. **Replace hardcoded spaces (line 17-21):**
```typescript
// REMOVE THIS:
const spaces = [
  { id: '1', name: 'Cosmic Creators' },
  { id: '2', name: 'Astronomy Hub' },
  { id: '3', name: 'Y2K Aesthetics' }
];

// REPLACE WITH:
const { spaces } = useSpaces();
```

3. **Add hooks and get user data:**
```typescript
const { profile, user } = useAuth();
const { createPost } = usePosts();
```

4. **Fix handleSubmit function (line 23-31):**
```typescript
const handleSubmit = async () => {
  if (!content.trim()) {
    toast.error('Please enter some content');
    return;
  }

  if (!selectedSpace) {
    toast.error('Please select a space');
    return;
  }

  const result = await createPost({
    space_id: selectedSpace,
    title: content.substring(0, 100), // Use first 100 chars as title
    body: content,
  });

  if (result) {
    toast.success('Post created!');
    navigate('/home');
  }
};
```

5. **Fix user display (line 69-75):**
```typescript
<div className="flex items-center gap-3 mb-4">
  <img
    src={profile?.avatar_url || "/avatar.png"}
    alt="Your avatar"
    className="w-12 h-12 rounded-full border-2 border-primary/30"
  />
  <div>
    <p className="font-semibold">{profile?.username || 'User'}</p>
    <select
      value={selectedSpace}
      onChange={(e) => setSelectedSpace(e.target.value)}
      className="text-sm bg-muted/50 border border-border rounded-lg px-2 py-1 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <option value="">Select a space (required)</option>
      {spaces.map((space) => (
        <option key={space.id} value={space.id}>
          {space.name}
        </option>
      ))}
    </select>
  </div>
</div>
```

---

### Fix 2: Make CreatePostModal Actually Create Posts

**Location:** `src/components/CreatePostModal.tsx`

**Changes needed:**

1. **Import required hooks:**
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { toast } from 'sonner';
```

2. **Update component to create posts:**
```typescript
export const CreatePostModal = ({ isOpen, onClose, onSubmit }: CreatePostModalProps) => {
  const [content, setContent] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('');
  const { profile, user } = useAuth();
  const { spaces } = useSpaces();
  const { createPost } = usePosts();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    if (!selectedSpace) {
      toast.error('Please select a space');
      return;
    }

    const result = await createPost({
      space_id: selectedSpace,
      title: content.substring(0, 100),
      body: content,
    });

    if (result) {
      toast.success('Post created!');
      setContent('');
      setSelectedSpace('');
      onSubmit?.(content);
      onClose();
    }
  };
```

3. **Fix user display (line 68-76):**
```typescript
<div className="flex items-center gap-3 mb-4">
  <img
    src={profile?.avatar_url || "/avatar.png"}
    alt="Your avatar"
    className="w-10 h-10 rounded-full border-2 border-primary/30"
  />
  <div>
    <p className="font-medium">{profile?.username || 'User'}</p>
    <p className="text-sm text-muted-foreground">@{profile?.username || 'user'}</p>
  </div>
</div>
```

4. **Add space selector before textarea:**
```typescript
<select
  value={selectedSpace}
  onChange={(e) => setSelectedSpace(e.target.value)}
  className="w-full mb-4 bg-muted/50 border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
>
  <option value="">Select a space (required)</option>
  {spaces.map((space) => (
    <option key={space.id} value={space.id}>
      {space.name}
    </option>
  ))}
</select>
```

---

### Fix 3: Add Edit Profile Functionality

**Location:** `src/pages/Profile.tsx`

**Changes needed:**

1. **Add state for edit modal:**
```typescript
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const { updateProfile } = useAuth();
```

2. **Fix Edit Profile button (line 70-73):**
```typescript
<CosmicButton 
  className="flex items-center gap-2"
  onClick={() => setIsEditModalOpen(true)}
>
  <Edit2 className="w-4 h-4" />
  Edit Profile
</CosmicButton>
```

3. **Import and add EditProfileModal:**
```typescript
import { EditProfileModal } from '@/components/EditProfileModal';
```

4. **Add modal at end of component:**
```typescript
<EditProfileModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  profile={profile}
  onUpdate={async (updates) => {
    await updateProfile(updates);
    setIsEditModalOpen(false);
  }}
/>
```

**New File: `src/components/EditProfileModal.tsx`**
- Create this new component with form fields for:
  - Username
  - Bio
  - Avatar URL (or file upload)
- Use `updateProfile` from `useAuth` to save changes

---

### Fix 4: Fix HomeFeed CreatePostModal Integration

**Location:** `src/pages/HomeFeed.tsx`

**Changes needed:**

1. **Import usePosts hook:**
```typescript
const { createPost } = usePosts();
```

2. **Fix CreatePostModal onSubmit (line 114-121):**
```typescript
<CreatePostModal 
  isOpen={isCreateModalOpen} 
  onClose={() => setIsCreateModalOpen(false)}
  onSubmit={async (content, spaceId) => {
    if (content && spaceId) {
      await createPost({
        space_id: spaceId,
        title: content.substring(0, 100),
        body: content,
      });
      refetch();
      setIsCreateModalOpen(false);
    }
  }}
/>
```

---

---

### 5. **Comments Feature - INCOMPLETE**

#### Problem:
- Comments button in PostCard doesn't do anything
- No way to view or add comments to posts
- `useComments` hook exists but isn't being used

#### Files to Fix:

**File 1: `src/components/PostCard.tsx`**
- **Line 91-94**: Comments button needs `onClick` handler to open comments
- **Missing**: Need to add comments display section or modal

**File 2: `src/pages/SpaceDetail.tsx` or create new component**
- Need to integrate `useComments` hook
- Add comment input form
- Display comments list

---

### 6. **Follow/Unfollow Feature - NOT IMPLEMENTED**

#### Problem:
- Follow button in Explore page doesn't work
- No hook exists for follow/unfollow functionality
- "Following" tab in HomeFeed doesn't work

#### Files to Fix:

**File 1: `src/pages/Explore.tsx`**
- **Line 183-185**: Follow button has no `onClick` handler
- **Line 166-170**: Hardcoded users should be fetched from database

**New File Needed: `src/hooks/useFollows.ts`**
- Create hook for follow/unfollow functionality
- Functions: `followUser`, `unfollowUser`, `isFollowing`, `getFollowers`, `getFollowing`

**File 2: `src/pages/HomeFeed.tsx`**
- **Line 19**: "Following" feed type needs to filter posts by followed users
- Need to integrate follow functionality

---

## 🎯 SUMMARY OF FILES TO EDIT

1. **`src/pages/CreatePost.tsx`** - Fix post creation, use real spaces and user data
2. **`src/components/CreatePostModal.tsx`** - Fix post creation, use real user data
3. **`src/pages/Profile.tsx`** - Add edit profile functionality
4. **`src/pages/HomeFeed.tsx`** - Fix CreatePostModal integration
5. **`src/components/EditProfileModal.tsx`** - CREATE NEW FILE for editing profile
6. **`src/components/PostCard.tsx`** - Add comments functionality
7. **`src/components/CommentsSection.tsx`** - CREATE NEW FILE for displaying comments
8. **`src/pages/Explore.tsx`** - Fix follow button functionality
9. **`src/hooks/useFollows.ts`** - CREATE NEW FILE for follow/unfollow functionality

---

---

### Fix 5: Add Comments Functionality

**Location:** `src/components/PostCard.tsx`

**Changes needed:**

1. **Add state for comments modal:**
```typescript
const [showComments, setShowComments] = useState(false);
```

2. **Fix comments button (line 91-94):**
```typescript
<button 
  onClick={(e) => { 
    e.stopPropagation(); 
    setShowComments(true);
  }}
  className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"
>
  <MessageCircle className="w-5 h-5" />
  <span className="text-sm">{comments}</span>
</button>
```

3. **Import and add CommentsSection:**
```typescript
import { CommentsSection } from './CommentsSection';
```

4. **Add comments section:**
```typescript
{showComments && (
  <CommentsSection 
    postId={id} 
    onClose={() => setShowComments(false)} 
  />
)}
```

**New File: `src/components/CommentsSection.tsx`**
- Create component that uses `useComments` hook
- Display list of comments
- Add input form to create new comments
- Handle nested/reply comments

---

### Fix 6: Add Follow/Unfollow Functionality

**New File: `src/hooks/useFollows.ts`**
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFollows = (userId?: string) => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const followUser = async (targetUserId: string) => {
    if (!user) {
      toast.error('You must be logged in to follow users');
      return false;
    }

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      });

    if (error) {
      if (error.code === '23505') {
        toast.info('You are already following this user');
      } else {
        toast.error('Failed to follow user');
      }
      return false;
    }

    toast.success('User followed!');
    checkFollowing(targetUserId);
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
      toast.error('Failed to unfollow user');
      return false;
    }

    toast.success('User unfollowed');
    checkFollowing(targetUserId);
    return true;
  };

  const checkFollowing = async (targetUserId: string) => {
    if (!user || !targetUserId) return;

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  // ... fetch followers and following lists

  return {
    followers,
    following,
    isFollowing,
    followUser,
    unfollowUser,
    checkFollowing
  };
};
```

**Location:** `src/pages/Explore.tsx`

**Changes needed:**

1. **Import useFollows:**
```typescript
import { useFollows } from '@/hooks/useFollows';
```

2. **Fetch real users to follow (replace hardcoded list):**
```typescript
// Fetch users from database instead of hardcoded list
const { data: users } = await supabase
  .from('profiles')
  .select('id, username, avatar_url')
  .neq('id', user?.id)
  .limit(10);
```

3. **Fix Follow button (line 183-185):**
```typescript
const { followUser, unfollowUser, isFollowing } = useFollows(user.id);

<button 
  onClick={() => {
    if (isFollowing) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  }}
  className="px-3 py-1 text-sm font-medium bg-primary/20 text-primary rounded-full hover:bg-primary/30 transition-colors"
>
  {isFollowing ? 'Unfollow' : 'Follow'}
</button>
```

---

## ✅ TESTING CHECKLIST

After making these fixes, test:
- [ ] Can create a post from CreatePost page
- [ ] Can create a post from CreatePostModal
- [ ] Posts appear in the feed after creation
- [ ] Edit Profile button opens a modal
- [ ] Can update username, bio, and avatar
- [ ] Spaces dropdown shows real spaces from database
- [ ] User avatar and name display correctly everywhere
- [ ] No hardcoded user data remains
- [ ] Comments button opens comments section
- [ ] Can add comments to posts
- [ ] Comments display correctly
- [ ] Follow button works in Explore page
- [ ] Can follow/unfollow users
- [ ] "Following" tab shows posts from followed users

---

## 📝 NOTES

- All database operations should use the hooks (`usePosts`, `useSpaces`, `useAuth`)
- Always check if user is logged in before allowing actions
- Use `toast` from `sonner` for success/error messages
- Posts require a `space_id` - cannot be null
- Profile updates use `updateProfile` from `useAuth` context

